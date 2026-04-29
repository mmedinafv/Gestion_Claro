// backend/controllers/solicitudesController.js
const pool = require('../config/db');

const solicitudesController = {

    // ==================== LISTAR TODAS ====================
    getAll: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    n.id_nodo as id,
                    n.numero_producto,
                    n.cliente,
                    c.nombre_empresa as cliente_empresa,
                    n.localidad,
                    n.departamento,
                    n.direccion,
                    n.servicio,
                    n.ancho_banda,
                    n.id_medio,
                    n.ingeniero_asignado,
                    i.nombre as ingeniero,
                    n.estado_proceso,
                    n.observaciones,
                    n.fecha_estimada_instalacion,
                    n.fecha_ingreso
                FROM nodos n
                LEFT JOIN clientes c ON n.id_cliente = c.id_cliente
                LEFT JOIN ingenieros i ON n.ingeniero_asignado = i.id_ingeniero
                ORDER BY n.id_nodo DESC
            `);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('❌ Error getAll solicitudes:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== OBTENER POR ID ====================
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute(`
                SELECT * FROM nodos WHERE id_nodo = ?
            `, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('❌ Error getById:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== CREAR NUEVA SOLICITUD ====================
    create: async (req, res) => {
        try {
            const data = req.body;

            const [result] = await pool.execute(`
                INSERT INTO nodos 
                (numero_producto, cliente, id_cliente, localidad, departamento, direccion, 
                 servicio, ancho_banda, id_medio, ingeniero_asignado, observaciones, 
                 fecha_estimada_instalacion, estado_proceso)
                VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.numero_producto,
                data.cliente,
                data.localidad,
                data.departamento,
                data.direccion,
                data.servicio || 'Internet',
                data.ancho_banda,
                data.id_medio,
                data.ingeniero_asignado,
                data.observaciones || '',
                data.fecha_estimada_instalacion,
                data.estado_proceso || 'Ing-No Elaborada'
            ]);

            res.status(201).json({
                success: true,
                message: '✅ Solicitud creada correctamente',
                id: result.insertId
            });
        } catch (error) {
            console.error('❌ Error al crear solicitud:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== ACTUALIZAR SOLICITUD ====================
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
                    direccion = ?,
                    servicio = ?,
                    ancho_banda = ?,
                    id_medio = ?,
                    ingeniero_asignado = ?,
                    observaciones = ?,
                    fecha_estimada_instalacion = ?,
                    estado_proceso = ?
                WHERE id_nodo = ?
            `, [
                data.numero_producto,
                data.cliente,
                data.localidad,
                data.departamento,
                data.direccion,
                data.servicio,
                data.ancho_banda,
                data.id_medio,
                data.ingeniero_asignado,
                data.observaciones,
                data.fecha_estimada_instalacion,
                data.estado_proceso,
                id
            ]);

            res.json({ success: true, message: '✅ Solicitud actualizada correctamente' });
        } catch (error) {
            console.error('❌ Error al actualizar solicitud:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== ELIMINAR SOLICITUD ====================
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute(`DELETE FROM nodos WHERE id_nodo = ?`, [id]);

            res.json({ success: true, message: '🗑 Solicitud eliminada correctamente' });
        } catch (error) {
            console.error('❌ Error al eliminar solicitud:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = solicitudesController;