document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();

    document.getElementById('btnVolverMenu')?.addEventListener('click', volverMenu);

    document.getElementById('apply-filters').addEventListener('click', loadInstalaciones);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);

    loadInstalaciones(); // carga inicial
});

async function loadInstalaciones() {
    const search = document.getElementById('search-instalacion').value.trim();
    const estado = document.getElementById('filter-estado').value;

    let url = '/api/instalaciones';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (estado) params.append('estado', estado);

    if (params.toString()) url += '?' + params.toString();

    try {
        const res = await apiFetch(url);
        if (res.success) {
            renderInstalaciones(res.data);
        }
    } catch (e) {
        console.error(e);
    }
}

function clearFilters() {
    document.getElementById('search-instalacion').value = '';
    document.getElementById('filter-estado').value = '';
    loadInstalaciones();
}

function renderInstalaciones(data) {
    const tbody = document.querySelector('#instalaciones-table tbody');
    tbody.innerHTML = '';

    document.getElementById('result-count').textContent = `(${data.length} registros)`;

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:70px;color:#777;">No se encontraron instalaciones con los filtros aplicados</td></tr>`;
        return;
    }

    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.nombre}</strong></td>
                <td>
                    <strong>75%</strong>
                    <div style="background:#e0e0e0;height:12px;border-radius:10px;margin-top:4px;">
                        <div style="width:75%;background:linear-gradient(90deg,#1a237e,#4caf50);height:100%;"></div>
                    </div>
                </td>
                <td>${item.codigo_sitio || '-'}</td>
                <td>${item.medio || '-'}</td>
                <td><span class="status-badge ${statusClass(item.estado_proceso)}">${item.estado_proceso}</span></td>
                <td>—</td>
            </tr>`;
    });
}