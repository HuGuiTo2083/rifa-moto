document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('contador');
    const btnIncrementar = document.getElementById('incrementar');
    const btnDecrementar = document.getElementById('decrementar');
    const labelPrecio = document.getElementById('precio');
    const success = document.getElementById('dvSuccess');
    const PRECIO_BASE = 98; // Precio base por unidad

    let cantidad = parseInt(input.value);

      function actualizarPrecio() {
        cantidad = parseInt(input.value);
        const precioTotal = cantidad * PRECIO_BASE;
        labelPrecio.textContent = `${precioTotal} bs`;
    }


    // Asegurar valor mínimo de 1
    input.addEventListener('change', () => {
        if (input.value < 1) input.value = 1;
    });

    btnIncrementar.addEventListener('click', () => {
        input.value = parseInt(input.value) + 1;
        actualizarPrecio();
    });

    btnDecrementar.addEventListener('click', () => {
        const nuevoValor = parseInt(input.value) - 1;
        if (nuevoValor >= 1) {
            input.value = nuevoValor;
            actualizarPrecio();
        }
    });
    
    // ------------------

    const inputs = document.querySelectorAll('.dvForm input:not(.contador-input)');
    
    // Función para validar email
    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Función para validar los campos
    function validarFormulario() {
       
        return esValido;
    }

    // Puedes llamar a esta función cuando necesites validar
    // Por ejemplo, podrías agregar un botón:
  
    const btnValidar = document.getElementById('btPedir');
    
   // btnValidar.onclick = validarFormulario;
    
    //----

    document.getElementById('pedidoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const pedido = Object.fromEntries(formData.entries());
        
        // Añadir el precio total al pedido
        pedido.correo = document.getElementById('inEmail').value;
        pedido.nombre = document.getElementById('inName').value;
        pedido.apellido = document.getElementById('inLastName').value;
        pedido.referencias = parseInt(document.getElementById('inFor').value);
        pedido.numero = parseInt(document.getElementById('inNumber').value);
        pedido.aprobado = false
        pedido.boletos = parseInt(cantidad);
        pedido.precioTotal = parseInt(document.getElementById('precio').textContent);
        
        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });
    
            const data = await response.json();
            if (data.success) {
                alert('Pedido realizado correctamente');
                e.target.reset();
                document.getElementById('contador').value = 1;
                actualizarPrecio();
            } else {
                alert('Error al realizar el pedido');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar el pedido');
        }

        //------/

         

        //-----/
    });
    //----
    
    // O llamarla directamente:
    // validarFormulario();


});