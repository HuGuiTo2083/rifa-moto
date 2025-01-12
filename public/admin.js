document.addEventListener('DOMContentLoaded',  () => {
    console.log("h2")
    cargarPedidos()
});

async function cargarPedidos() {
    console.log("h3")
    try {
        const response = await fetch('/api/pedidos');
        const pedidos = await response.json();
        const contenedor = document.getElementById('contenedorPedidos');
        contenedor.innerHTML = '';

        pedidos.forEach(pedido => {
            const divPedido = document.createElement('div');
            divPedido.className = `dvPedido ${pedido.aprobado ? 'aprobado' : 'pendiente'}`;
            
            divPedido.innerHTML = `
                <h3>Pedido #${pedido.referencias}</h3>
                <p><strong>Cliente:</strong> ${pedido.nombre} ${pedido.apellido}</p>
                <p><strong>Correo:</strong> ${pedido.correo}</p>
                <p><strong>Número:</strong> ${pedido.numero}</p>
                <p><strong>Precio Total:</strong> $${pedido.precioTotal} </p>
                <p><strong>No. de Boletos:</strong> ${pedido.boletos} </p>
                <button 
                    class="btnAprobar" 
                    onclick="aprobarPedido(${pedido.referencias})"
                    ${pedido.aprobado ? 'disabled' : ''}
                >
                    ✓ ${pedido.aprobado ? 'Aprobado' : 'Aprobar'}
                </button>
            `;
            
            contenedor.appendChild(divPedido);
        });
    } catch (error) {
        console.error('Error al cargar los pedidos:', error);
    }
}

async function aprobarPedido(referencia) {
    try {
        const response = await fetch(`/api/pedidos/${referencia}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // Recargar los pedidos para mostrar los cambios
            cargarPedidos();
        } else {
            console.error('Error al aprobar el pedido');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
