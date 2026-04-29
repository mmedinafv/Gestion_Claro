// ingenieros.js - Completo con Combo limitado
document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();

    document.getElementById('btnVolverMenu')?.addEventListener('click', volverMenu);
    document.getElementById('nuevoIngenieroBtn')?.addEventListener('click', nuevoIngeniero);

    loadIngenieros();
});

async function loadIngenieros() {
    try {
        const res = await apiFetch('/api/ingenieros');
        if (res.success) renderIngenieros(res.data);
    } catch (e) {
        showNotification('Error al cargar ingenieros', 'error');
    }
}

function nuevoIngeniero() {
    document.getElementById('modal-ingeniero-title').textContent = 'Nuevo Ingeniero';
    document.getElementById('form-ingeniero').reset();
    document.getElementById('ingeniero-id').value = '';
    openModal('modal-ingeniero');
}

document.getElementById('form-ingeniero').addEventListener('submit', saveIngeniero);

async function saveIngeniero(e) {
    e.preventDefault();

    const id = document.getElementById('ingeniero-id').value;
    const data = {
        nombre: document.getElementById('ingeniero-nombre').value.trim(),
        especialidad: document.getElementById('ingeniero-especialidad').value,
        telefono: document.getElementById('ingeniero-telefono').value.trim(),
        email: document.getElementById('ingeniero-email').value.trim(),
        activo: document.getElementById('ingeniero-activo').value === '1'
    };

    if (!data.nombre) {
        showNotification('El nombre es obligatorio', 'error');
        return;
    }

    try {
        let res;
        if (id) {
            res = await apiFetch(`/api/ingenieros/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            showNotification('✅ Ingeniero actualizado', 'success');
        } else {
            res = await apiFetch('/api/ingenieros', { method: 'POST', body: JSON.stringify(data) });
            showNotification('✅ Ingeniero creado correctamente', 'success');
        }

        closeModal('modal-ingeniero');
        loadIngenieros();
    } catch (error) {
        showNotification('Error al guardar ingeniero', 'error');
    }
}

function renderIngenieros(data) {
    const tbody = document.querySelector('#ingenieros-table tbody');
    tbody.innerHTML = '';

    data.forEach(ing => {
        tbody.innerHTML += `
            <tr>
                <td>${ing.id_ingeniero}</td>
                <td><strong>${ing.nombre}</strong></td>
                <td>${ing.especialidad || '-'}</td>
                <td>${ing.telefono || '-'}</td>
                <td>${ing.email || '-'}</td>
                <td><span class="status-badge ${ing.activo ? 'status-completado' : 'status-pendiente'}">
                    ${ing.activo ? 'Activo' : 'Inactivo'}
                </span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editIngeniero(${ing.id_ingeniero})">✏️ Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteIngeniero(${ing.id_ingeniero})">🗑 Eliminar</button>
                </td>
            </tr>`;
    });
}

async function editIngeniero(id) {
    try {
        const res = await apiFetch(`/api/ingenieros/${id}`);
        if (res.success) {
            const ing = res.data;
            document.getElementById('modal-ingeniero-title').textContent = 'Editar Ingeniero';
            document.getElementById('ingeniero-id').value = ing.id_ingeniero;
            document.getElementById('ingeniero-nombre').value = ing.nombre || '';
            document.getElementById('ingeniero-especialidad').value = ing.especialidad || '';
            document.getElementById('ingeniero-telefono').value = ing.telefono || '';
            document.getElementById('ingeniero-email').value = ing.email || '';
            document.getElementById('ingeniero-activo').value = ing.activo ? '1' : '0';
            openModal('modal-ingeniero');
        }
    } catch (e) {
        showNotification('Error al cargar ingeniero', 'error');
    }
}

async function deleteIngeniero(id) {
    if (!confirm('¿Eliminar este ingeniero?')) return;
    try {
        await apiFetch(`/api/ingenieros/${id}`, { method: 'DELETE' });
        showNotification('✅ Ingeniero eliminado', 'success');
        loadIngenieros();
    } catch (e) {
        showNotification('Error al eliminar ingeniero', 'error');
    }
}