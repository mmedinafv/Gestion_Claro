// controllers/solicitudesController.js - CRUD COMPLETO Y COMPATIBLE
const pool = require('../config/db');

const solicitudesController = {

    // ==================== LISTAR ====================
    getAll: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
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
                ORDER BY n.id_nodo DESC
            `);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('Error getAll:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== OBTENER POR ID ====================
    getById: async (req, res) => {
        try {
            const [rows] = await pool.execute('SELECT * FROM nodos WHERE id_nodo = ?', [req.params.id]);
            res.json({ success: rows.length > 0, data: rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== CREAR ====================
    create: async (req, res) => {
        try {
            const data = req.body;
            const [result] = await pool.execute(`
                INSERT INTO nodos 
                (numero_producto, cliente, localidad, departamento, servicio, 
                 ancho_banda, id_medio, ingeniero_asignado, observaciones, 
                 fecha_estimada_instalacion, estado_proceso)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ing-No Elaborada')
            `, [
                "PROD-" + Date.now(),
                data.cliente || null,
                data.localidad,
                data.departamento,
                data.servicio || 'Internet',
                data.ancho_banda,
                data.id_medio || null,
                data.ingeniero_asignado || null,
                data.observaciones || '',
                data.fecha_estimada_instalacion || null
            ]);

            res.status(201).json({
                success: true,
                id: result.insertId,
                message: 'Solicitud creada correctamente'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== ACTUALIZAR ====================
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            await pool.execute(`
                UPDATE nodos SET 
                    cliente = ?, localidad = ?, departamento = ?, servicio = ?,
                    ancho_banda = ?, id_medio = ?, ingeniero_asignado = ?,
                    observaciones = ?, fecha_estimada_instalacion = ?
                WHERE id_nodo = ?
            `, [
                data.cliente, data.localidad, data.departamento, data.servicio,
                data.ancho_banda, data.id_medio, data.ingeniero_asignado,
                data.observaciones, data.fecha_estimada_instalacion, id
            ]);

            res.json({ success: true, message: 'Solicitud actualizada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== ELIMINAR ====================
    delete: async (req, res) => {
        const conn = await pool.getConnection();
        try {
            const { id } = req.params;

            await conn.beginTransaction();

            const [existe] = await conn.execute(
                'SELECT numero_producto FROM nodos WHERE id_nodo = ?', [id]
            );

            if (existe.length === 0) {
                await conn.rollback();
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
            }

            // Eliminar registros hijos primero
            await conn.execute('DELETE FROM historial_estados WHERE id_nodo = ?', [id]);

            // Eliminar la solicitud
            await conn.execute('DELETE FROM nodos WHERE id_nodo = ?', [id]);

            await conn.commit();

            res.json({
                success: true,
                message: `✅ Solicitud ${existe[0].numero_producto} eliminada correctamente`
            });
        } catch (error) {
            await conn.rollback();
            console.error('❌ Error al eliminar solicitud:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar la solicitud' });
        } finally {
            conn.release();
        }
    }
};

module.exports = solicitudesController;