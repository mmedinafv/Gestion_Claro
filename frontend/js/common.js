// common.js - Versión estable y mejorada (Abril 2026)
const API_URL = 'http://localhost:5001';

async function apiFetch(url, options = {}) {
    try {
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (options.body) {
            config.body = options.body;
        }

        const response = await fetch(API_URL + url, config);

        // Leer el cuerpo de error si existe
        let errorDetail = '';
        if (!response.ok) {
            try {
                const errorData = await response.json();
                errorDetail = errorData.message || JSON.stringify(errorData);
            } catch (e) {
                errorDetail = await response.text().catch(() => 'Sin detalle');
            }

            console.error(`❌ Error HTTP ${response.status}:`, errorDetail);
            throw new Error(`HTTP ${response.status} - ${errorDetail}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("❌ Error en apiFetch:", error);

        // Mensaje más claro para el usuario
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
            showNotification('❌ No se puede conectar al servidor. Verifica que esté corriendo en el puerto 5001', 'error');
        } else {
            showNotification('Error de conexión con el servidor', 'error');
        }

        throw error;
    }
}

// ==================== USUARIO ====================
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function setupUserInfo() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const nameEl = document.getElementById('userNameDisplay');
    const roleEl = document.getElementById('userRoleDisplay');

    if (nameEl) nameEl.textContent = user.nombre || user.nombre_completo || user.username || 'Usuario';
    if (roleEl) roleEl.textContent = user.rol || user.nombre_rol || 'Sin rol';
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

function volverMenu() {
    window.location.href = 'menu.html';
}

// ==================== MODALES ====================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'block';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// ==================== NOTIFICACIONES ====================
function showNotification(message, type = 'success') {
    // Eliminar notificaciones anteriores del mismo tipo
    document.querySelectorAll(`.notification-${type}`).forEach(n => n.remove());

    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    n.textContent = message;
    document.body.appendChild(n);

    setTimeout(() => {
        if (n.parentNode) n.remove();
    }, 4500);
}

function statusClass(estado = '') {
    if (!estado) return 'status-pendiente';
    if (estado.includes('Cancelada') || estado.includes('cancelado')) return 'status-cancelado';
    if (estado.includes('Proceso') || estado.includes('proceso')) return 'status-proceso';
    if (estado.includes('finalizada') || estado.includes('Finalizada') || estado.includes('Aplicada')) return 'status-completado';
    return 'status-pendiente';
}

// Exponer funciones globales
window.apiFetch = apiFetch;
window.setupUserInfo = setupUserInfo;
window.setupLogout = setupLogout;
window.volverMenu = volverMenu;
window.openModal = openModal;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.statusClass = statusClass;