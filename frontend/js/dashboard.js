// dashboard.js - Gráficas corregidas
let chartIngenieros = null;
let chartEstados = null;

document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();
    loadDashboard();
});

async function loadDashboard() {
    try {
        const res = await apiFetch('/api/dashboard/resumen');
        if (!res.success) throw new Error(res.message || 'Error desconocido');

        const d = res.data || {};

        document.getElementById('total-solicitudes').textContent = d.total_solicitudes || 0;
        document.getElementById('en-proceso').textContent = d.en_proceso || 0;
        document.getElementById('completadas').textContent = d.completadas || 0;
        document.getElementById('pendientes').textContent = d.pendientes || 0;

        renderChartIngenieros(d.porIngeniero || []);
        renderChartEstados(d.porEstado || [], d.total_solicitudes || 0);

        const solicitudesRes = await apiFetch('/api/solicitudes');
        if (solicitudesRes.success) renderUltimasSolicitudes(solicitudesRes.data.slice(0, 5));

    } catch (e) {
        console.error(e);
        showNotification('Error al cargar el Dashboard', 'error');
    }
}

function renderChartIngenieros(data) {
    const ctx = document.getElementById('chart-ingenieros');
    if (!ctx) return;
    if (chartIngenieros) chartIngenieros.destroy();

    chartIngenieros = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.ingeniero || 'Sin Asignar'),
            datasets: [{
                label: 'Solicitudes',
                data: data.map(item => item.cantidad || 0),
                backgroundColor: '#f00d0d',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function renderChartEstados(data, total) {
    const ctx = document.getElementById('chart-estados');
    if (!ctx) return;
    if (chartEstados) chartEstados.destroy();

    chartEstados = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.estado),
            datasets: [{
                data: data.map(item => item.cantidad),
                backgroundColor: ['#2196f3', '#ff9800', '#4caf50', '#f44336', '#9c27b0'],
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', padding: 20 },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderUltimasSolicitudes(lista) {
    const tbody = document.querySelector('#ultimas-solicitudes tbody');
    tbody.innerHTML = '';
    lista.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${s.numero_producto || '-'}</strong></td>
                <td>${s.cliente || '-'}</td>
                <td>${s.ingeniero || '-'}</td>
                <td><span class="status-badge ${statusClass(s.estado_proceso)}">${s.estado_proceso}</span></td>
                <td>${s.fecha_estimada_instalacion ? s.fecha_estimada_instalacion.substring(0, 10) : '-'}</td>
            </tr>`;
    });
}