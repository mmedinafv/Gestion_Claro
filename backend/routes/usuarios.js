document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();

    document.getElementById('btnVolverMenu').addEventListener('click', volverMenu);
    document.getElementById('nuevoUsuarioBtn').addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Nuevo Usuario';
        document.getElementById('form-usuario').reset();
        document.getElementById('user-id').value = '';
        loadRoles();
        openModal('modal-usuario');
    });

    document.getElementById('form-usuario').addEventListener('submit', saveUsuario);

    loadUsuarios();
});

async function loadUsuarios() {
    try {
        const res = await apiFetch('/api/usuarios');
        if (res.success) renderUsuarios(res.data);
    } catch (e) {
        showNotification('Error al cargar usuarios', 'error');
    }
}

async function loadRoles() {
    // Por ahora cargamos roles estáticos (puedes mejorarlo después)
    const select = document.getElementById('id_rol');
    select.innerHTML = `
        <option value="1">Administrador General</option>
        <option value="2">Administrador de Ingenierías</option>
        <option value="3">Ingeniero</option>
    `;
}

async function saveUsuario(e) {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const data = {
        username: document.getElementById('username').value,
        nombre_completo: document.getElementById('nombre_completo').value,
        password: document.getElementById('password').value || undefined,
        id_rol: document.getElementById('id_rol').value,
        activo: document.getElementById('activo').value === '1'
    };

    try {
        let res;
        if (id) {
            res = await apiFetch(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        } else {
            res = await apiFetch('/api/usuarios', { method: 'POST', body: JSON.stringify(data) });
        }

        if (res.success) {
            showNotification('Usuario guardado correctamente', 'success');
            closeModal('modal-usuario');
            loadUsuarios();
        }
    } catch (error) {
        showNotification('Error al guardar usuario', 'error');
    }
}

function renderUsuarios(data) {
    const tbody = document.querySelector('#usuarios-table tbody');
    tbody.innerHTML = '';

    data.forEach(user => {
        tbody.innerHTML += `
            <tr>
                <td>${user.id_usuario}</td>
                <td><strong>${user.username}</strong></td>
                <td>${user.nombre_completo}</td>
                <td>${user.nombre_rol}</td>
                <td><span class="status-badge ${user.activo ? 'status-completado' : 'status-pendiente'}">
                    ${user.activo ? 'Activo' : 'Inactivo'}
                </span></td>
                <td>
                    <button class="btn btn-secondary" onclick="editUsuario(${user.id_usuario})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteUsuario(${user.id_usuario})">Eliminar</button>
                </td>
            </tr>`;
    });
}

async function editUsuario(id) {
    try {
        const res = await apiFetch(`/api/usuarios/${id}`);
        if (res.success) {
            const u = res.data;
            document.getElementById('modal-title').textContent = 'Editar Usuario';
            document.getElementById('user-id').value = u.id_usuario;
            document.getElementById('username').value = u.username;
            document.getElementById('nombre_completo').value = u.nombre_completo;
            document.getElementById('id_rol').value = u.id_rol;
            document.getElementById('activo').value = u.activo ? '1' : '0';
            openModal('modal-usuario');
        }
    } catch (e) { }
}

async function deleteUsuario(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
        await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        showNotification('Usuario eliminado', 'success');
        loadUsuarios();
    } catch (e) {
        showNotification('Error al eliminar', 'error');
    }
}