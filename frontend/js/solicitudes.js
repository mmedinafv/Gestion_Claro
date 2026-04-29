// solicitudes.js - Búsqueda + Crear + Editar funcionando
let currentPage = 1;
const limit = 20;

document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();

    document.getElementById('btnVolverMenu')?.addEventListener('click', volverMenu);
    document.getElementById('nuevaSolicitudBtn').addEventListener('click', nuevaSolicitud);

    const searchInput = document.getElementById('search-solicitud');
    let timeout;

    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        currentPage = 1;
        timeout = setTimeout(loadSolicitudes, 400);
    });

    loadSolicitudes();
});

async function loadSolicitudes() {
    const searchTerm = document.getElementById('search-solicitud').value.trim();

    let url = `/api/solicitudes?page=${currentPage}&limit=${limit}`;
    if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    try {
        const res = await apiFetch(url);
        if (res.success) {
            renderSolicitudes(res.data);
        }
    } catch (e) {
        showNotification('Error al cargar solicitudes', 'error');
    }
}

function renderSolicitudes(data) {
    const tbody = document.querySelector('#solicitudes-table tbody');
    tbody.innerHTML = '';

    document.getElementById('result-count').textContent = `(${data.length} registros)`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:100px;color:#777;">No se encontraron resultados</td></tr>`;
        return;
    }

    data.forEach(s => {
        const fecha = s.fecha_estimada_instalacion
            ? new Date(s.fecha_estimada_instalacion).toISOString().split('T')[0]
            : '-';

        tbody.innerHTML += `
            <tr>
                <td><strong>${s.numero_producto || '-'}</strong></td>
                <td>${s.cliente || '-'}</td>
                <td>${s.localidad || '-'}</td>
                <td>${s.departamento || '-'}</td>
                <td>${s.servicio || '-'}</td>
                <td>${s.ancho_banda || '-'}</td>
                <td>${s.ingeniero || '-'}</td>
                <td><span class="status-badge ${statusClass(s.estado_proceso)}">${s.estado_proceso || 'Pendiente'}</span></td>
                <td>${fecha}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editSolicitud(${s.id})">✏️ Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSolicitud(${s.id})">🗑 Eliminar</button>
                </td>
            </tr>`;
    });
}

// ==================== NUEVA SOLICITUD ====================
async function nuevaSolicitud() {
    document.getElementById('modalTitle').textContent = 'Nueva Solicitud';
    document.getElementById('solicitudForm').reset();
    document.getElementById('id_nodo').value = '';

    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    document.getElementById('numero_producto').value = `PROD-${year}${random}`;

    await loadCombosForModal();
    openModal('solicitudModal');
}

// ==================== EDITAR SOLICITUD ====================
async function editSolicitud(id) {
    try {
        const res = await apiFetch(`/api/solicitudes/${id}`);
        if (!res.success) return showNotification('Solicitud no encontrada', 'error');

        const s = res.data;
        document.getElementById('modalTitle').textContent = 'Editar Solicitud';
        document.getElementById('id_nodo').value = s.id_nodo || s.id;

        document.getElementById('numero_producto').value = s.numero_producto || '';
        document.getElementById('cliente').value = s.cliente || '';
        document.getElementById('localidad').value = s.localidad || '';
        document.getElementById('departamento').value = s.departamento || '';
        document.getElementById('servicio').value = s.servicio || 'Internet';
        document.getElementById('ancho_banda').value = s.ancho_banda || '';
        document.getElementById('observaciones').value = s.observaciones || '';
        document.getElementById('fecha_estimada_instalacion').value = s.fecha_estimada_instalacion
            ? new Date(s.fecha_estimada_instalacion).toISOString().split('T')[0] : '';

        await loadCombosForModal(s.id_medio, s.ingeniero_asignado);
        openModal('solicitudModal');
    } catch (e) {
        showNotification('Error al cargar solicitud', 'error');
    }
}

// ==================== COMBOS ====================
async function loadCombosForModal(selectedMedio = null, selectedIngeniero = null) {
    try {
        const [mediosRes, ingenierosRes] = await Promise.all([
            apiFetch('/api/combos/medios'),
            apiFetch('/api/combos/ingenieros')
        ]);

        // Medios
        const medioSelect = document.getElementById('id_medio');
        medioSelect.innerHTML = '<option value="">Seleccione Medio</option>';
        (mediosRes.data || []).forEach(m => {
            const opt = new Option(m.nombre_medio, m.id_medio);
            if (m.id_medio == selectedMedio) opt.selected = true;
            medioSelect.add(opt);
        });

        // Ingenieros
        const ingSelect = document.getElementById('ingeniero_asignado');
        ingSelect.innerHTML = '<option value="">Seleccione Ingeniero</option>';
        (ingenierosRes.data || []).forEach(i => {
            const opt = new Option(i.nombre, i.id_ingeniero);
            if (i.id_ingeniero == selectedIngeniero) opt.selected = true;
            ingSelect.add(opt);
        });
    } catch (e) {
        showNotification('Error al cargar combos', 'error');
    }
}

// ==================== GUARDAR ====================
document.getElementById('solicitudForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('id_nodo').value;
    const data = {
        numero_producto: document.getElementById('numero_producto').value,
        cliente: document.getElementById('cliente').value,
        localidad: document.getElementById('localidad').value,
        departamento: document.getElementById('departamento').value,
        servicio: document.getElementById('servicio').value,
        ancho_banda: document.getElementById('ancho_banda').value,
        id_medio: document.getElementById('id_medio').value || null,
        ingeniero_asignado: document.getElementById('ingeniero_asignado').value || null,
        observaciones: document.getElementById('observaciones').value,
        fecha_estimada_instalacion: document.getElementById('fecha_estimada_instalacion').value || null
    };

    try {
        if (id) {
            await apiFetch(`/api/solicitudes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            showNotification('✅ Solicitud actualizada', 'success');
        } else {
            await apiFetch('/api/solicitudes', { method: 'POST', body: JSON.stringify(data) });
            showNotification('✅ Solicitud creada', 'success');
        }

        closeModal('solicitudModal');
        loadSolicitudes();
    } catch (e) {
        showNotification('Error al guardar', 'error');
    }
});

async function deleteSolicitud(id) {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    try {
        await apiFetch(`/api/solicitudes/${id}`, { method: 'DELETE' });
        showNotification('✅ Solicitud eliminada', 'success');
        loadSolicitudes();
    } catch (e) {
        showNotification('Error al eliminar', 'error');
    }
}

// Funciones globales
window.editSolicitud = editSolicitud;
window.deleteSolicitud = deleteSolicitud;
window.nuevaSolicitud = nuevaSolicitud;