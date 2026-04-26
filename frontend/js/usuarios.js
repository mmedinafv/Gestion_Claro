document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo(); setupLogout();
    if (!isAdmin()) { window.location.href = 'menu.html'; return; }
    const form = document.getElementById('form-usuario');
    renderUsuarios();
    document.getElementById('nuevoUsuarioBtn').addEventListener('click', () => { form.reset(); document.getElementById('usuario-id').value=''; document.getElementById('modal-usuario-title').textContent='Nuevo Usuario'; document.getElementById('usuario-password').required = true; document.getElementById('usuario-password-confirm').required = true; openModal('modal-usuario'); });
    document.getElementById('cancel-usuario').addEventListener('click', () => closeModal('modal-usuario'));
    document.getElementById('cerrarModalUsuario').addEventListener('click', () => closeModal('modal-usuario'));
    form.addEventListener('submit', e => {
        e.preventDefault();
        let usuarios = getData('usuarios', []);
        const id = document.getElementById('usuario-id').value;
        const pass = document.getElementById('usuario-password').value;
        const pass2 = document.getElementById('usuario-password-confirm').value;
        if (pass !== pass2) return showNotification('Las contraseñas no coinciden.', 'error');
        const username = document.getElementById('usuario-username').value.trim();
        if (usuarios.some(u => u.username === username && u.id !== Number(id))) return showNotification('Ese usuario ya existe.', 'error');
        const anterior = usuarios.find(u => u.id === Number(id));
        const data = {id: id ? Number(id) : Date.now(), username, password: pass || anterior?.password || '1234', nombre: document.getElementById('usuario-nombre').value.trim(), email: document.getElementById('usuario-email').value.trim(), rol: document.getElementById('usuario-rol').value, estado: 'Activo', creado: anterior?.creado || new Date().toISOString().slice(0,10)};
        if (id) usuarios = usuarios.map(u => u.id === Number(id) ? data : u); else usuarios.push(data);
        saveData('usuarios', usuarios); renderUsuarios(); closeModal('modal-usuario'); showNotification('Usuario guardado correctamente.');
    });
});
function renderUsuarios(){const usuarios=getData('usuarios', []); const actual=getCurrentUser(); const tbody=document.querySelector('#usuarios-table tbody'); tbody.innerHTML=''; if(!usuarios.length){tbody.innerHTML='<tr><td colspan="8">No hay usuarios registrados.</td></tr>'; return;} usuarios.forEach(u=>{const borrar=u.id===actual.id?'No permitido':`<button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${u.id})">Eliminar</button>`; tbody.innerHTML+=`<tr><td>${u.id}</td><td>${u.username}</td><td>${u.nombre}</td><td>${u.email || ''}</td><td>${u.rol}</td><td><span class="status-badge status-completado">${u.estado}</span></td><td>${u.creado || ''}</td><td><button class="btn btn-secondary btn-sm" onclick="editarUsuario(${u.id})">Editar</button> ${borrar}</td></tr>`;});}
function editarUsuario(id){const u=getData('usuarios', []).find(x=>x.id===id); if(!u)return; document.getElementById('modal-usuario-title').textContent='Editar Usuario'; document.getElementById('usuario-id').value=u.id; document.getElementById('usuario-username').value=u.username; document.getElementById('usuario-password').value=''; document.getElementById('usuario-password-confirm').value=''; document.getElementById('usuario-password').required=false; document.getElementById('usuario-password-confirm').required=false; document.getElementById('usuario-nombre').value=u.nombre; document.getElementById('usuario-email').value=u.email || ''; document.getElementById('usuario-rol').value=u.rol; openModal('modal-usuario');}
function eliminarUsuario(id){const actual=getCurrentUser(); if(actual.id===id)return showNotification('No puedes eliminar tu propio usuario.', 'error'); if(!confirm('¿Seguro que deseas eliminar este usuario?'))return; const usuarios=getData('usuarios', []).filter(u=>u.id!==id); saveData('usuarios', usuarios); renderUsuarios(); showNotification('Usuario eliminado correctamente.');}
