const API_URL = 'http://localhost:5001';

async function apiFetch(url, options = {}) {
    try {
        const res = await fetch(API_URL + url, {
            method: options.method || 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: options.body ? JSON.stringify(options.body) : null
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("❌ Error:", error);
        showNotification('Error de conexión con el servidor (puerto 5001)', 'error');
        throw error;
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function setupUserInfo() {
    const user = getCurrentUser();
    if (!user) return window.location.href = 'login.html';

    document.getElementById('userNameDisplay').textContent = user.nombre || user.username;
    document.getElementById('userRoleDisplay').textContent = user.rol || '';
}

function setupLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

function volverMenu() {
    window.location.href = 'menu.html';
}

function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function showNotification(message, type = 'success') {
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}

function statusClass(estado = '') {
    if (estado.includes('Cancelada')) return 'status-cancelado';
    if (estado.includes('Proceso')) return 'status-proceso';
    if (estado.includes('finalizada') || estado.includes('Aplicada')) return 'status-completado';
    return 'status-pendiente';
}