document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();
    loadCombos();
    loadSolicitudes();

    document.getElementById('nuevaSolicitudBtn').addEventListener('click', () => {
        document.getElementById('form-solicitud').reset();
        document.getElementById('modal-title').textContent = 'Nueva Solicitud';
        openModal('modal-solicitud');
    });

    document.getElementById('form-solicitud').addEventListener('submit', saveSolicitud);
    document.getElementById('apply-filters').addEventListener('click', loadSolicitudes);
});

async function loadSolicitudes() {
    const filtros = {
        estado: document.getElementById('filter-estado').value,
        ingeniero: document.getElementById('filter-ingeniero').value,
        cliente: document.getElementById('search-cliente').value
    };

    const data = await apiFetch(`/api/solicitudes?${new URLSearchParams(filtros)}`);
    if (data.success) renderSolicitudes(data.data);
}

async function loadCombos() {
    const [ingenieros, medios] = await Promise.all([
        apiFetch('/api/combos/ingenieros'),
        apiFetch('/api/combos/medios')
    ]);

    // Llenar selects...
    const ingSelect = document.getElementById('ingeniero-select');
    ingenieros.data.forEach(i => {
        ingSelect.innerHTML += `<option value="${i.id_ingeniero}">${i.nombre}</option>`;
    });
}

async function saveSolicitud(e) {
    e.preventDefault();
    const formData = {
        numero_producto: "PROD-" + Date.now(),
        id_cliente: 1,
        localidad: document.getElementById('localidad').value,
        departamento: document.getElementById('departamento').value,
        direccion: document.getElementById('direccion').value,
        servicio: document.getElementById('servicio').value,
        ancho_banda: document.getElementById('ab').value,
        id_medio: document.getElementById('medio').value,
        ingeniero_asignado: document.getElementById('ingeniero-select').value,
        observaciones: document.getElementById('observaciones').value,
        fecha_estimada_instalacion: document.getElementById('fecha_inicio').value
    };

    const res = await apiFetch('/api/solicitudes', { method: 'POST', body: JSON.stringify(formData) });
    if (res.success) {
        showNotification('Solicitud guardada correctamente');
        closeModal('modal-solicitud');
        loadSolicitudes();
    }
}