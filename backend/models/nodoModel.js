const pool = require('../config/db');

const NodoModel = {

    // =============================================================
    // DASHBOARD - Estadísticas
    // =============================================================
    getEstadisticas: async () => {
        try {
            const [stats] = await pool.execute(`
                SELECT 
                    estado_proceso,
                    color_estado,
                    COUNT(*) as cantidad
                FROM nodos 
                GROUP BY estado_proceso, color_estado
            `);

            const [[totales]] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_solicitudes,
                    SUM(CASE WHEN estado_proceso IN ('Ing-en Proceso', 'FO-en Proceso-Instalacion') THEN 1 ELSE 0 END) as en_proceso,
                    SUM(CASE WHEN estado_proceso IN ('Ing-lista y Aplicada', 'Fibra-Instal/finalizada') THEN 1 ELSE 0 END) as completadas,
                    SUM(CASE WHEN estado_proceso = 'Ing-No Elaborada' THEN 1 ELSE 0 END) as pendientes
                FROM nodos
            `);

            return {
                porEstado: stats,
                totales
            };
        } catch (error) {
            throw error;
        }
    },

    // =============================================================
    // SOLICITUDES - Tabla principal
    // =============================================================
    getAllSolicitudes: async (filtros = {}) => {
        let query = `
            SELECT 
                n.id_nodo as id,
                n.numero_producto as numero_producto,
                c.nombre_empresa as cliente,
                COALESCE(i.nombre, 'Sin asignar') as ingeniero,
                n.localidad,
                n.servicio,
                n.ancho_banda as ab,
                n.estado_proceso as estado,
                n.codigo_sitio,
                COALESCE(s.nombre_sitio, '') as nombre_sitio,
                COALESCE(m.nombre_medio, '') as medio,
                DATEDIFF(CURRENT_DATE, DATE(n.fecha_ingreso)) as dias
            FROM nodos n
            LEFT JOIN clientes c ON n.id_cliente = c.id_cliente
            LEFT JOIN ingenieros i ON n.ingeniero_asignado = i.id_ingeniero
            LEFT JOIN sitios s ON n.codigo_sitio = s.codigo_sitio
            LEFT JOIN medios m ON n.id_medio = m.id_medio
            WHERE 1=1`;

        const params = [];

        if (filtros.estado && filtros.estado !== '') {
            query += " AND n.estado_proceso = ?";
            params.push(filtros.estado);
        }
        if (filtros.ingeniero && filtros.ingeniero !== '') {
            query += " AND i.nombre = ?";
            params.push(filtros.ingeniero);
        }
        if (filtros.cliente && filtros.cliente !== '') {
            query += " AND c.nombre_empresa LIKE ?";
            params.push(`%${filtros.cliente}%`);
        }

        query += " ORDER BY n.fecha_ingreso DESC";

        const [rows] = await pool.execute(query, params);
        return rows;
    },

    // Crear nueva solicitud desde el modal "Nueva Solicitud"
    createSolicitud: async (data) => {
        const query = `
            INSERT INTO nodos (
                numero_producto, id_cliente, codigo_sitio, id_medio,
                ingeniero_asignado, localidad, departamento, direccion,
                servicio, ancho_banda, fecha_estimada_instalacion,
                observaciones, estado_proceso, color_estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await pool.execute(query, [
            data.numero_producto || `PROD-${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
            data.id_cliente || 1,                    // Temporal - luego puedes mejorar con búsqueda
            data.codigo_sitio || null,
            data.id_medio || null,
            data.ingeniero_asignado || null,
            data.localidad,
            data.departamento,
            data.direccion,
            data.servicio || 'Internet',
            data.ab || data.ancho_banda,
            data.fecha_inicio || null,
            data.observaciones || '',
            'Ing-No Elaborada',
            'Sin color'
        ]);

        return result.insertId;
    },

    // =============================================================
    // INSTALACIONES - Vista de Instalaciones
    // =============================================================
    getAllInstalaciones: async (filtros = {}) => {
        let query = `
            SELECT 
                n.id_nodo as id,
                CONCAT(n.servicio, ' - ', c.nombre_empresa) as nombre,
                ROUND(RAND() * 100) as porcentaje_instalacion,   -- Temporal (puedes crear tabla de avances después)
                n.codigo_sitio,
                s.nombre_sitio,
                m.nombre_medio as medio,
                n.observaciones as comentarios,
                n.estado_proceso
            FROM nodos n
            LEFT JOIN clientes c ON n.id_cliente = c.id_cliente
            LEFT JOIN sitios s ON n.codigo_sitio = s.codigo_sitio
            LEFT JOIN medios m ON n.id_medio = m.id_medio
            WHERE n.estado_proceso IN ('FO-en Proceso-Instalacion', 'Fibra-Instal/finalizada')
        `;

        const params = [];

        if (filtros.medio && filtros.medio !== '') {
            query += " AND m.nombre_medio = ?";
            params.push(filtros.medio);
        }
        if (filtros.search && filtros.search !== '') {
            query += " AND (c.nombre_empresa LIKE ? OR s.codigo_sitio LIKE ? OR s.nombre_sitio LIKE ?)";
            params.push(`%${filtros.search}%`, `%${filtros.search}%`, `%${filtros.search}%`);
        }

        query += " ORDER BY n.fecha_ingreso DESC";

        const [rows] = await pool.execute(query, params);
        return rows;
    },

    // =============================================================
    // COMBOS / SELECTS
    // =============================================================
    getSitios: async () => {
        const [rows] = await pool.execute(`
            SELECT codigo_sitio, nombre_sitio 
            FROM sitios 
            WHERE activo = TRUE 
            ORDER BY codigo_sitio
        `);
        return rows;
    },

    getMedios: async () => {
        const [rows] = await pool.execute(`
            SELECT id_medio, nombre_medio 
            FROM medios 
            WHERE activo = TRUE 
            ORDER BY nombre_medio
        `);
        return rows;
    },

    getIngenieros: async () => {
        const [rows] = await pool.execute(`
            SELECT id_ingeniero, nombre 
            FROM ingenieros 
            WHERE activo = TRUE 
            ORDER BY nombre
        `);
        return rows;
    }
};

module.exports = NodoModel;