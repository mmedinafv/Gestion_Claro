const pool = require('../config/db');

const instalacionesController = {

    getAll: async (req, res) => {
        try {
            const { search, estado } = req.query;

            let query = `
                SELECT 
                    n.id_nodo as id,
                    CONCAT(COALESCE(c.nombre_empresa, 'Sin cliente'), ' - ', n.servicio) as nombre,
                    75 as porcentaje_instalacion,
                    n.codigo_sitio,
                    COALESCE(s.nombre_sitio, '-') as sitio,
                    COALESCE(m.nombre_medio, '-') as medio,
                    n.observaciones as comentarios,
                    n.estado_proceso
                FROM nodos n
                LEFT JOIN clientes c ON n.id_cliente = c.id_cliente
                LEFT JOIN sitios s ON n.codigo_sitio = s.codigo_sitio
                LEFT JOIN medios m ON n.id_medio = m.id_medio
                WHERE 1=1
            `;

            const params = [];

            if (estado && estado.trim() !== '') {
                query += ` AND n.estado_proceso = ?`;
                params.push(estado);
            }

            if (search && search.trim() !== '') {
                query += ` AND (c.nombre_empresa LIKE ? OR s.nombre_sitio LIKE ? OR n.codigo_sitio LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            query += ` ORDER BY n.fecha_ingreso DESC`;

            const [rows] = await pool.execute(query, params);

            res.json({ success: true, data: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = instalacionesController;