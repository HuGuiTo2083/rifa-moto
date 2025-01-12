document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('button');
    const inputs = document.querySelectorAll('input');
    
    button.addEventListener('click', () => {
        const usuario = inputs[0].value;
        const password = inputs[1].value;
        
        if (usuario === 'admin' && password === '2083AlexAutos2083') {
            window.location.href = 'admin.html';
        } else {
            alert('Usuario o contraseña incorrectos');
            // Limpiar los campos
            inputs[0].value = '';
            inputs[1].value = '';
            inputs[0].focus();
        }
    });
});