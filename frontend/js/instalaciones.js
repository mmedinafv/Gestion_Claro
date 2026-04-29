// instalaciones.js - Solo Estado + Porcentaje
document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();

    document.getElementById('btnVolverMenu')?.addEventListener('click', volverMenu);

    const searchInput = document.getElementById('search-instalacion');
    const filterEstado = document.getElementById('filter-estado');
    const clearBtn = document.getElementById('clear-filters');

    let timeout;

    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(loadInstalaciones, 300);
    });

    filterEstado.addEventListener('change', loadInstalaciones);
    clearBtn.addEventListener('click', clearFilters);

    loadInstalaciones();
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
        if (res.success) renderInstalaciones(res.data);
    } catch (e) {
        showNotification('Error al cargar instalaciones', 'error');
    }
}

function clearFilters() {
    document.getElementById('search-instalacion').value = '';
    document.getElementById('filter-estado').value = '';
    loadInstalaciones();
}

function getPercentageByState(estado) {
    switch (estado) {
        case 'Fibra-Instal/finalizada': return 100;
        case 'FO-en Proceso-Instalacion': return 80;
        case 'Ing-en Proceso': return 45;
        case 'Ing-No Elaborada': return 0;
        default: return 0;
    }
}

function renderInstalaciones(data) {
    const tbody = document.querySelector('#instalaciones-table tbody');
    tbody.innerHTML = '';

    document.getElementById('result-count').textContent = `(${data.length} registros)`;

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:120px;color:#777;">No hay instalaciones aún.<br><small>Crea solicitudes para que aparezcan aquí</small></td></tr>`;
        return;
    }

    data.forEach(item => {
        const porcentaje = getPercentageByState(item.estado_proceso);

        tbody.innerHTML += `
            <tr data-id="${item.id}">
                <td><strong>${item.nombre}</strong></td>
                <td style="font-size: 18px; font-weight: bold; text-align: center;">${porcentaje}%</td>
                <td><strong>${item.codigo_sitio || '-'}</strong></td>
                <td>${item.servicio || '-'}</td>
                <td>
                    <select class="estado-select" onchange="cambiarEstado(this)">
                        <option value="Ing-No Elaborada" ${item.estado_proceso === 'Ing-No Elaborada' ? 'selected' : ''}>📋 Pendiente</option>
                        <option value="Ing-en Proceso" ${item.estado_proceso === 'Ing-en Proceso' ? 'selected' : ''}>⏳ En Proceso</option>
                        <option value="FO-en Proceso-Instalacion" ${item.estado_proceso === 'FO-en Proceso-Instalacion' ? 'selected' : ''}>🔄 FO en Instalación</option>
                        <option value="Fibra-Instal/finalizada" ${item.estado_proceso === 'Fibra-Instal/finalizada' ? 'selected' : ''}>✅ Finalizada</option>
                    </select>
                </td>
                <td>${item.comentarios || '-'}</td>
            </tr>`;
    });
}

// ==================== CAMBIAR ESTADO ====================
async function cambiarEstado(select) {
    const row = select.closest('tr');
    const id_nodo = row.dataset.id;
    const nuevoEstado = select.value;

    try {
        const response = await fetch(`http://localhost:5001/api/instalaciones/${id_nodo}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado_proceso: nuevoEstado })
        });

        const res = await response.json();
        if (res.success) {
            showNotification('✅ Estado actualizado', 'success');
            loadInstalaciones();
        }
    } catch (e) {
        showNotification('Error al actualizar estado', 'error');
    }
}