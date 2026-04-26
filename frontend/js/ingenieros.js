document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();
    loadIngenieros();

    // Botón Nuevo Ingeniero
    const nuevoBtn = document.getElementById('nuevoIngenieroBtn');
    if (nuevoBtn) nuevoBtn.addEventListener('click', abrirModalNuevo);

    // Formulario
    const form = document.getElementById('form-ingeniero');
    if (form) form.addEventListener('submit', guardarIngeniero);

    // Botón Volver
    const btnVolver = document.getElementById('btnVolverMenu');
    if (btnVolver) {
        btnVolver.addEventListener('click', (e) => {
            e.preventDefault();
            volverMenu();
        });
    }

    // Cerrar modal
    document.getElementById('cerrarModalIngeniero')?.addEventListener('click', () => closeModal('modal-ingeniero'));
    document.getElementById('cancel-ingeniero')?.addEventListener('click', () => closeModal('modal-ingeniero'));
});

async function loadIngenieros() {
    try {
        const res = await apiFetch('/api/ingenieros');
        if (res.success) {
            renderIngenieros(res.data);
        }
    } catch (e) {
        console.error(e);
    }
}

function renderIngenieros(ingenieros) {
    const tbody = document.querySelector('#ingenieros-table tbody');
    tbody.innerHTML = '';

    document.getElementById('total-ingenieros').textContent = ingenieros.length;
    document.getElementById('ingenieros-activos').textContent = ingenieros.length;

    ingenieros.forEach(ing => {
        tbody.innerHTML += `
            <tr>
                <td>${ing.id_ingeniero}</td>
                <td><strong>${ing.nombre}</strong></td>
                <td>${ing.especialidad || 'General'}</td>
                <td>${ing.telefono || '-'}</td>
                <td>${ing.email || '-'}</td>
                <td><span class="status-badge status-completado">Activo</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editarIngeniero(${ing.id_ingeniero})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarIngeniero(${ing.id_ingeniero})">Eliminar</button>
                </td>
            </tr>`;
    });
}

// ==================== ABRIR MODAL NUEVO ====================
function abrirModalNuevo() {
    document.getElementById('form-ingeniero').reset();
    document.getElementById('ingeniero-id').value = '';
    document.getElementById('modal-ingeniero-title').textContent = 'Nuevo Ingeniero';
    openModal('modal-ingeniero');
}

// ==================== EDITAR (CORREGIDO) ====================
window.editarIngeniero = async function (id) {
    try {
        const res = await apiFetch('/api/ingenieros');
        const ingeniero = res.data.find(i => i.id_ingeniero === id);

        if (!ingeniero) {
            showNotification('Ingeniero no encontrado', 'error');
            return;
        }

        // Cargar datos en el formulario
        document.getElementById('ingeniero-id').value = ingeniero.id_ingeniero;
        document.getElementById('ingeniero-nombre').value = ingeniero.nombre;
        document.getElementById('ingeniero-especialidad').value = ingeniero.especialidad || 'General';
        document.getElementById('ingeniero-telefono').value = ingeniero.telefono || '';
        document.getElementById('ingeniero-email').value = ingeniero.email || '';

        document.getElementById('modal-ingeniero-title').textContent = `Editar Ingeniero #${ingeniero.id_ingeniero}`;
        openModal('modal-ingeniero');

    } catch (error) {
        console.error(error);
        showNotification('Error al cargar datos del ingeniero', 'error');
    }
};

// ==================== GUARDAR (Crear o Editar) ====================
async function guardarIngeniero(e) {
    e.preventDefault();

    const id = document.getElementById('ingeniero-id').value;
    const data = {
        nombre: document.getElementById('ingeniero-nombre').value.trim(),
        especialidad: document.getElementById('ingeniero-especialidad').value,
        telefono: document.getElementById('ingeniero-telefono').value.trim(),
        email: document.getElementById('ingeniero-email').value.trim()
    };

    try {
        if (id) {
            // Actualizar
            await apiFetch(`/api/ingenieros/${id}`, { method: 'PUT', body: data });
            showNotification('Ingeniero actualizado correctamente');
        } else {
            // Crear nuevo
            await apiFetch('/api/ingenieros', { method: 'POST', body: data });
            showNotification('Ingeniero creado correctamente');
        }

        closeModal('modal-ingeniero');
        loadIngenieros(); // Recargar tabla
    } catch (error) {
        showNotification('Error al guardar ingeniero', 'error');
    }
}

// ==================== ELIMINAR ====================
window.eliminarIngeniero = async function (id) {
    if (!confirm('¿Estás seguro de eliminar este ingeniero?')) return;

    try {
        await apiFetch(`/api/ingenieros/${id}`, { method: 'DELETE' });
        showNotification('Ingeniero eliminado correctamente');
        loadIngenieros();
    } catch (e) {
        showNotification('Error al eliminar ingeniero', 'error');
    }
};