// server.js
const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs'); // Añade esta líne
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const port = 3000;

// Ruta al archivo de tickets
const ticketsPath = path.join(__dirname, 'tickets.json');

// Función para leer tickets existentes
async function leerTickets() {
    try {
        // Verificar si el archivo existe
        if (!fsSync.existsSync(ticketsPath)) {
            // Si no existe, crear un archivo con un array vacío
            await fs.writeFile(ticketsPath, JSON.stringify([], null, 2));
            return [];
        }
        const data = await fs.readFile(ticketsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer tickets:', error);
        return []; // Retorna array vacío en caso de error
    }
}

// Función para generar números aleatorios únicos
async function generarNumerosBoletosUnicos(cantidad) {
    const tickets = await leerTickets();
    const numerosExistentes = new Set(tickets.map(t => t.numero));
    const numerosGenerados = new Set();
    
    while (numerosGenerados.size < cantidad) {
        const numeroAleatorio = Math.floor(Math.random() * 10000) + 1;
        if (!numerosExistentes.has(numeroAleatorio) && !numerosGenerados.has(numeroAleatorio)) {
            numerosGenerados.add(numeroAleatorio);
        }
    }
    
    return Array.from(numerosGenerados);
}

// Función para guardar nuevos tickets
async function guardarTickets(nuevosTickets) {
    const tickets = await leerTickets();
    tickets.push(...nuevosTickets);
    await fs.writeFile(ticketsPath, JSON.stringify(tickets, null, 2));
}




// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'autosalex95@gmail.com', // Tu correo Gmail
        pass: 'mbxu ehuc hgrs kiks' // Contraseña de aplicación de Gmail
    }
});

// Define la ruta del archivo aquí, al inicio
const pedidosPath = path.join(__dirname, 'pedidos.json');

// Middleware para parsear JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));


// Ruta para obtener todos los pedidos
app.get('/api/pedidos', async (req, res) => {
    try {
        const pedidosPath = path.join(__dirname, 'pedidos.json');
        const data = await fs.readFile(pedidosPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error al leer pedidos:', error);
        res.status(500).json({ error: 'Error al leer los pedidos' });
    }
});

// Actualiza la ruta PUT
app.put('/api/pedidos/:referencia', async (req, res) => {
    try {
        const referencia = parseInt(req.params.referencia);
        const data = await fs.readFile(pedidosPath, 'utf8');
        const pedidos = JSON.parse(data);
        
        const pedidoIndex = pedidos.findIndex(p => p.referencias === referencia);
        if (pedidoIndex !== -1) {
            pedidos[pedidoIndex].aprobado = true;
            await fs.writeFile(pedidosPath, JSON.stringify(pedidos, null, 2));

            // Generar números de boletos
            const pedido = pedidos[pedidoIndex];
            const numerosGenerados = await generarNumerosBoletosUnicos(pedido.boletos);
            
            // Guardar los nuevos tickets
            const nuevosTickets = numerosGenerados.map(numero => ({
                numero,
                referencia: pedido.referencias,
                propietario: `${pedido.nombre} ${pedido.apellido}`,
                correo: pedido.correo,
                fechaCompra: new Date().toISOString()
            }));
            
            await guardarTickets(nuevosTickets);

            // Enviar correo de confirmación
            const mailOptions = {
                from: 'autosalex95@gmail.com',
                to: pedido.correo,
                subject: '¡Tu pedido ha sido aprobado!',
                html: `
                    <h1>¡Pedido Aprobado!</h1>
                    <p>Hola ${pedido.nombre} ${pedido.apellido},</p>
                    <p>Nos complace informarte que tu pedido con referencia #${pedido.referencias} ha sido aprobado.</p>
                    <h2>Detalles del pedido:</h2>
                    <ul>
                        <li>Número de boletos: ${pedido.boletos}</li>
                        <li>Precio total: $${pedido.precioTotal}</li>
                        <li>Número de contacto: ${pedido.numero}</li>
                    </ul>
                    <h2>Tus números de boletos son:</h2>
                    <ul>
                        ${numerosGenerados.map(numero => 
                            `<li>Boleto #${numero}</li>`
                        ).join('')}
                    </ul>
                    <p>¡Gracias por tu compra y mucha suerte!</p>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log('Correo enviado correctamente');
            } catch (emailError) {
                console.error('Error al enviar correo:', emailError);
            }

            res.json({ 
                success: true, 
                tickets: numerosGenerados 
            });
        } else {
            res.status(404).json({ error: 'Pedido no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({ error: 'Error al actualizar el pedido' });
    }
});

// Ruta para guardar pedidos
app.post('/api/pedidos', async (req, res) => {
    console.log("2aa")
    try {
        let pedidos = [];
        
        // Verificar si el archivo existe
        if (fsSync.existsSync(pedidosPath)) {
            const contenido = await fs.readFile(pedidosPath, 'utf8');
            try {
                pedidos = JSON.parse(contenido);
            } catch (parseError) {
                console.error('Error al parsear JSON:', parseError);
                pedidos = []; // Si hay error al parsear, comenzamos con array vacío
            }
        }

        // Verificar que pedidos sea un array
        if (!Array.isArray(pedidos)) {
            pedidos = [];
        }

        // Añadir el nuevo pedido
        pedidos.push(req.body);

        // Guardar el archivo actualizado
        await fs.writeFile(pedidosPath, JSON.stringify(pedidos, null, 2), 'utf8');

        res.json({ success: true, message: 'Pedido guardado correctamente' });
    } catch (error) {
        console.error('Error específico:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al guardar el pedido',
            error: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});