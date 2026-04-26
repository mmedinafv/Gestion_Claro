document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();
    loadDashboard();
});

async function loadDashboard() {
    const data = await apiFetch('/api/dashboard/resumen');
    if (!data.success) return;

    document.getElementById('total-solicitudes').textContent = data.data.total_solicitudes || 0;
    document.getElementById('en-proceso').textContent = data.data.en_proceso || 0;
    document.getElementById('completadas').textContent = data.data.completadas || 0;
    document.getElementById('pendientes').textContent = data.data.pendientes || 0;

    // Cargar últimas solicitudes
    const solicitudesRes = await apiFetch('/api/solicitudes');
    if (solicitudesRes.success) renderUltimasSolicitudes(solicitudesRes.data.slice(0, 5));
}

function renderUltimasSolicitudes(lista) {
    const tbody = document.querySelector('#ultimas-solicitudes tbody');
    tbody.innerHTML = '';
    lista.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.numero_producto || s.id}</td>
                <td>${s.cliente}</td>
                <td>${s.ingeniero}</td>
                <td><span class="status-badge ${statusClass(s.estado)}">${s.estado}</span></td>
                <td>${s.fecha_ingreso ? s.fecha_ingreso.substring(0, 10) : ''}</td>
            </tr>`;
    });
}