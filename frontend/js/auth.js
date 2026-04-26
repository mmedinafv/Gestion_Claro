const API_URL = 'http://localhost:5001';   // ← Puerto correcto

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const msg = document.getElementById('loginMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            msg.className = 'login-message error';
            msg.textContent = 'Ingresa usuario y contraseña';
            return;
        }

        try {
            console.log("🔄 Intentando login...");

            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                msg.className = 'login-message success';
                msg.textContent = '✅ Login correcto, redirigiendo...';

                setTimeout(() => {
                    window.location.href = 'menu.html';
                }, 800);
            } else {
                msg.className = 'login-message error';
                msg.textContent = data.message || 'Credenciales incorrectas';
            }
        } catch (error) {
            console.error("❌ Error login:", error);
            msg.className = 'login-message error';
            msg.textContent = '❌ No se puede conectar al servidor (puerto 5001)';
        }
    });
});