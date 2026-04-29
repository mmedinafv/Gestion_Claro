// backend/controllers/ingenierosController.js
const pool = require('../config/db');

const ingenierosController = {

    getAll: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    id_ingeniero,
                    nombre,
                    especialidad,
                    telefono,
                    activo
                FROM ingenieros 
                ORDER BY id_ingeniero DESC
            `);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('❌ Error getAll ingenieros:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { nombre, especialidad = 'General', telefono } = req.body;

            if (!nombre?.trim()) {
                return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
            }

            const [result] = await pool.execute(`
                INSERT INTO ingenieros (nombre, especialidad, telefono, activo)
                VALUES (?, ?, ?, TRUE)
            `, [nombre.trim(), especialidad, telefono || null]);

            res.status(201).json({
                success: true,
                message: '✅ Ingeniero creado correctamente',
                id: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, especialidad, telefono, activo } = req.body;

            await pool.execute(`
                UPDATE ingenieros 
                SET nombre = ?, especialidad = ?, telefono = ?, activo = ?
                WHERE id_ingeniero = ?
            `, [nombre, especialidad, telefono, activo !== undefined ? activo : true, id]);

            res.json({ success: true, message: '✅ Ingeniero actualizado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute(`DELETE FROM ingenieros WHERE id_ingeniero = ?`, [id]);
            res.json({ success: true, message: '✅ Ingeniero eliminado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error al eliminar ingeniero' });
        }
    }
};

module.exports = ingenierosController;