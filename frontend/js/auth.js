const API_URL = 'http://localhost:5001';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            window.location.href = 'menu.html';
        } else {
            alert(data.message || 'Credenciales incorrectas');
        }
    } catch (error) {
        alert('No se puede conectar al servidor');
    }
});