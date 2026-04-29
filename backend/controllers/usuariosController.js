// controllers/usuariosController.js - CRUD COMPLETO Y CORREGIDO
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const usuariosController = {

    getAll: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT u.id_usuario, u.username, u.nombre_completo, 
                       r.nombre_rol as rol, u.activo, u.fecha_creacion
                FROM usuarios u
                JOIN roles r ON u.id_rol = r.id_rol
                ORDER BY u.id_usuario DESC
            `);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT id_usuario, username, nombre_completo, id_rol, activo 
                FROM usuarios WHERE id_usuario = ?
            `, [req.params.id]);
            res.json({ success: rows.length > 0, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { username, nombre_completo, password, id_rol, activo = true } = req.body;

            if (!username || !nombre_completo || !password || !id_rol) {
                return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
            }

            const hash = await bcrypt.hash(password, 10);

            const [result] = await pool.execute(`
                INSERT INTO usuarios (username, password_hash, nombre_completo, id_rol, activo)
                VALUES (?, ?, ?, ?, ?)
            `, [username, hash, nombre_completo, id_rol, activo]);

            res.status(201).json({
                success: true,
                message: 'Usuario creado correctamente',
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
            const { username, nombre_completo, password, id_rol, activo } = req.body;

            let query = `UPDATE usuarios SET username = ?, nombre_completo = ?, id_rol = ?, activo = ?`;
            let params = [username, nombre_completo, id_rol, activo];

            if (password && password.trim() !== '') {
                const hash = await bcrypt.hash(password, 10);
                query += `, password_hash = ?`;
                params.push(hash);
            }

            query += ` WHERE id_usuario = ?`;
            params.push(id);

            await pool.execute(query, params);

            res.json({ success: true, message: 'Usuario actualizado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute(`UPDATE usuarios SET activo = FALSE WHERE id_usuario = ?`, [id]);
            res.json({ success: true, message: 'Usuario desactivado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = usuariosController;