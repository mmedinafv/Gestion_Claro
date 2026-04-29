// backend/controllers/usuariosController.js - CORREGIDO DEFINITIVAMENTE
const pool = require('../config/db');

const usuariosController = {

    getAll: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    u.id_usuario,
                    u.username,
                    u.nombre_completo,
                    u.id_rol,
                    COALESCE(r.nombre_rol, 'Sin rol') as rol,
                    u.activo,
                    u.fecha_creacion
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id_rol
                ORDER BY u.id_usuario DESC
            `);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('❌ Error usuarios getAll:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute(`
                SELECT u.*, COALESCE(r.nombre_rol, 'Sin rol') as rol
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.id_usuario = ?
            `, [id]);
            res.json({ success: rows.length > 0, data: rows[0] || null });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { username, nombre_completo, id_rol = 1 } = req.body;
            const [result] = await pool.execute(`
                INSERT INTO usuarios (username, nombre_completo, id_rol, activo, password_hash)
                VALUES (?, ?, ?, 1, '123456')
            `, [username, nombre_completo, id_rol]);
            res.status(201).json({ success: true, id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre_completo, id_rol, activo } = req.body;
            await pool.execute(`
                UPDATE usuarios 
                SET nombre_completo = ?, id_rol = ?, activo = ?
                WHERE id_usuario = ?
            `, [nombre_completo, id_rol, activo, id]);
            res.json({ success: true, message: 'Usuario actualizado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
            res.json({ success: true, message: 'Usuario eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = usuariosController;