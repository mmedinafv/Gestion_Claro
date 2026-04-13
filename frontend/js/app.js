// app.js - Sistema Gestión Instalaciones Claro Honduras
const API_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos iniciales
    loadDashboard();
    loadSolicitudes();
    loadInstalaciones();
    loadIngenieros();
    loadCombos();

    // Navegación
    document.querySelectorAll('.nav-menu li').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-menu li').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const view = item.getAttribute('data-view');
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(view + '-view').classList.add('active');

            document.getElementById('page-title').textContent = item.textContent.trim();

            if (view === 'solicitudes') loadSolicitudes();
            if (view === 'instalaciones') loadInstalaciones();
            if (view === 'ingenieros') loadIngenieros();
        });
    });

    // Modal Nueva Solicitud
    document.getElementById('nuevaSolicitud').addEventListener('click', () => {
        document.getElementById('modal-solicitud').style.display = 'block';
    });

    // Modal Ingeniero
    document.getElementById('nuevoIngeniero').addEventListener('click', () => {
        document.getElementById('modal-ingeniero-title').textContent = 'Nuevo Ingeniero';
        document.getElementById('form-ingeniero').reset();
        document.getElementById('modal-ingeniero').style.display = 'block';
    });

    // Cerrar modales
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        });
    });

    // Guardar Nueva Solicitud
    document.getElementById('form-solicitud').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            localidad: document.getElementById('localidad').value,
            departamento: document.getElementById('departamento').value,
            direccion: document.getElementById('direccion').value,
            servicio: document.getElementById('servicio').value,
            ab: document.getElementById('ab').value,
            id_medio: document.getElementById('medio').value,
            codigo_sitio: document.getElementById('sitio').value,
            ingeniero_asignado: document.getElementById('ingeniero').value,
            observaciones: document.getElementById('observaciones').value,
            fecha_inicio: document.getElementById('fecha_inicio').value
        };

        try {
            const res = await fetch(`${API_URL}/api/solicitudes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                alert('Solicitud guardada correctamente');
                document.getElementById('modal-solicitud').style.display = 'none';
                loadSolicitudes();
            }
        } catch (err) {
            alert('Error al guardar solicitud');
        }
    });

    // Guardar Ingeniero
    document.getElementById('form-ingeniero').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nombre: document.getElementById('ingeniero-nombre').value,
            especialidad: document.getElementById('ingeniero-especialidad').value,
            telefono: document.getElementById('ingeniero-telefono').value,
            activo: document.getElementById('ingeniero-activo').value === '1'
        };

        try {
            const res = await fetch(`${API_URL}/api/ingenieros`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                alert('Ingeniero guardado correctamente');
                document.getElementById('modal-ingeniero').style.display = 'none';
                loadIngenieros();
            }
        } catch (err) {
            alert('Error al guardar ingeniero');
        }
    });

    // Filtros Solicitudes
    document.getElementById('apply-filters').addEventListener('click', () => {
        loadSolicitudes();
    });
});

// ==================== FUNCIONES DE CARGA ====================

async function loadDashboard() {
    try {
        const res = await fetch(`${API_URL}/api/dashboard/resumen`);
        const { success, data } = await res.json();
        if (success) {
            document.getElementById('total-solicitudes').textContent = data.total_solicitudes || 0;
            document.getElementById('en-proceso').textContent = data.en_proceso || 0;
            document.getElementById('completadas').textContent = data.completadas || 0;
            document.getElementById('pendientes').textContent = data.pendientes || 0;
        }
    } catch (e) { console.error(e); }
}

async function loadSolicitudes() {
    try {
        const res = await fetch(`${API_URL}/api/solicitudes`);
        const { success, data } = await res.json();
        if (success) {
            const tbody = document.querySelector('#solicitudes-table tbody');
            tbody.innerHTML = '';
            data.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${s.numero_producto || s.id}</td>
                    <td>${s.cliente}</td>
                    <td>${s.ingeniero}</td>
                    <td>${s.localidad}</td>
                    <td>${s.servicio}</td>
                    <td>${s.ab}</td>
                    <td><span class="status-badge">${s.estado}</span></td>
                    <td>${s.dias || '—'}</td>
                    <td><button class="btn btn-secondary">Editar</button></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) { console.error(e); }
}

async function loadInstalaciones() {
    try {
        const res = await fetch(`${API_URL}/api/instalaciones`);
        const { success, data } = await res.json();
        if (success) {
            const tbody = document.querySelector('#instalaciones-table tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${item.nombre}</strong></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <strong>${item.porcentaje_instalacion}%</strong>
                            <div style="flex: 1; background: #e0e0e0; height: 8px; border-radius: 10px;">
                                <div style="width: ${item.porcentaje_instalacion}%; background: linear-gradient(90deg, #1a237e, #4CAF50); height: 100%;"></div>
                            </div>
                        </div>
                    </td>
                    <td><strong>${item.codigo_sitio}</strong></td>
                    <td><span class="status-badge">${item.medio}</span></td>
                    <td>${item.comentarios || '-'}</td>
                    <td><button class="btn btn-secondary">Editar</button></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) { console.error(e); }
}

async function loadIngenieros() {
    try {
        const res = await fetch(`${API_URL}/api/ingenieros`);
        const { success, data } = await res.json();
        if (success) {
            const tbody = document.querySelector('#ingenieros-table tbody');
            tbody.innerHTML = '';
            data.forEach(ing => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${ing.id_ingeniero}</td>
                    <td><strong>${ing.nombre}</strong></td>
                    <td>${ing.especialidad || '-'}</td>
                    <td>${ing.telefono || '-'}</td>
                    <td><span class="status-badge ${ing.activo ? 'status-completado' : 'status-pendiente'}">
                        ${ing.activo ? 'Activo' : 'Inactivo'}
                    </span></td>
                    <td>
                        <button class="btn btn-secondary">Editar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) { console.error(e); }
}

async function loadCombos() {
    try {
        // Ingenieros
        const ingRes = await fetch(`${API_URL}/api/combos/ingenieros`);
        const ingData = await ingRes.json();
        if (ingData.success) {
            const select = document.getElementById('ingeniero');
            select.innerHTML = '<option value="">Seleccionar...</option>';
            ingData.data.forEach(i => {
                const opt = document.createElement('option');
                opt.value = i.id_ingeniero;
                opt.textContent = i.nombre;
                select.appendChild(opt);
            });
        }

        // Medios
        const medRes = await fetch(`${API_URL}/api/combos/medios`);
        const medData = await medRes.json();
        if (medData.success) {
            const select = document.getElementById('medio');
            select.innerHTML = '';
            medData.data.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id_medio;
                opt.textContent = m.nombre_medio;
                select.appendChild(opt);
            });
        }
    } catch (e) { console.error(e); }
}