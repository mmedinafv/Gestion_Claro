// backend/controllers/solicitudesController.js - CORREGIDO (Crear y Editar funcionando)
const pool = require('../config/db');

const solicitudesController = {

    getAll: async (req, res) => {
        try {
            const { search } = req.query;
            let query = `
                SELECT 
                    n.id_nodo as id,
                    n.numero_producto,
                    COALESCE(n.cliente, c.nombre_empresa, 'Sin cliente') as cliente,
                    n.localidad,
                    n.departamento,
                    n.servicio,
                    n.ancho_banda,
                    i.nombre as ingeniero,
                    n.estado_proceso,
                    n.observaciones,
                    n.fecha_estimada_instalacion
                FROM nodos n
                LEFT JOIN clientes c ON n.id_cliente = c.id_cliente
                LEFT JOIN ingenieros i ON n.ingeniero_asignado = i.id_ingeniero
                WHERE 1=1
            `;
            const params = [];

            if (search) {
                const term = `%${search}%`;
                query += ` AND (n.numero_producto LIKE ? OR COALESCE(n.cliente, c.nombre_empresa) LIKE ? OR n.localidad LIKE ?)`;
                params.push(term, term, term);
            }

            query += ` ORDER BY n.id_nodo DESC`;
            const [rows] = await pool.execute(query, params);
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute('SELECT * FROM nodos WHERE id_nodo = ?', [id]);
            res.json({ success: rows.length > 0, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const data = req.body;
            const [result] = await pool.execute(`
                INSERT INTO nodos 
                (numero_producto, cliente, localidad, departamento, servicio, ancho_banda, 
                 id_medio, ingeniero_asignado, observaciones, fecha_estimada_instalacion, estado_proceso)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ing-No Elaborada')
            `, [
                data.numero_producto,
                data.cliente,
                data.localidad,
                data.departamento,
                data.servicio || 'Internet',
                data.ancho_banda,
                data.id_medio || null,
                data.ingeniero_asignado || null,
                data.observaciones || '',
                data.fecha_estimada_instalacion || null
            ]);

            res.status(201).json({ success: true, id: result.insertId, message: 'Solicitud creada' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            await pool.execute(`
                UPDATE nodos SET 
                    numero_producto = ?,
                    cliente = ?,
                    localidad = ?,
                    departamento = ?,
                    servicio = ?,
                    ancho_banda = ?,
                    id_medio = ?,
                    ingeniero_asignado = ?,
                    observaciones = ?,
                    fecha_estimada_instalacion = ?
                WHERE id_nodo = ?
            `, [
                data.numero_producto,
                data.cliente,
                data.localidad,
                data.departamento,
                data.servicio || 'Internet',
                data.ancho_banda,
                data.id_medio || null,
                data.ingeniero_asignado || null,
                data.observaciones || '',
                data.fecha_estimada_instalacion || null,
                id
            ]);

            res.json({ success: true, message: 'Solicitud actualizada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute('DELETE FROM nodos WHERE id_nodo = ?', [id]);
            res.json({ success: true, message: 'Solicitud eliminada' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = solicitudesController;