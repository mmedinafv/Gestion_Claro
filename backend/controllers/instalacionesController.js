// backend/controllers/instalacionesController.js - CORREGIDO
const pool = require('../config/db');

const instalacionesController = {

    getAll: async (req, res) => {
        try {
            const { search, estado } = req.query;

            let query = `
                SELECT 
                    n.id_nodo as id,
                    COALESCE(n.cliente, c.nombre_empresa, 'Sin cliente') as nombre,
                    COALESCE(n.porcentaje_instalacion, 0) as porcentaje_instalacion,
                    n.codigo_sitio,
                    n.servicio,
                    n.estado_proceso,
                    n.observaciones as comentarios,
                    n.numero_producto
                FROM nodos n
                LEFT JOIN clientes c ON n.id_cliente = c.id_cliente
                WHERE 1=1
            `;

            const params = [];

            if (estado && estado.trim() !== '') {
                query += ` AND n.estado_proceso = ?`;
                params.push(estado);
            }

            if (search && search.trim() !== '') {
                const like = `%${search.trim()}%`;
                query += ` AND (
                    COALESCE(n.cliente, c.nombre_empresa) LIKE ? 
                    OR n.codigo_sitio LIKE ? 
                    OR n.servicio LIKE ?
                    OR n.localidad LIKE ?
                )`;
                params.push(like, like, like, like);
            }

            query += ` ORDER BY n.id_nodo DESC`;

            const [rows] = await pool.execute(query, params);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('❌ Error en instalaciones getAll:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateEstado: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado_proceso } = req.body;

            await pool.execute(`
                UPDATE nodos 
                SET estado_proceso = ?, 
                    fecha_ultima_actualizacion = NOW()
                WHERE id_nodo = ?
            `, [estado_proceso, id]);

            res.json({ success: true, message: 'Estado actualizado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = instalacionesController;