// controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const authController = {

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            const [users] = await pool.execute(`
                SELECT 
                    u.id_usuario,
                    u.username,
                    u.password_hash,
                    u.nombre_completo,
                    r.nombre_rol as rol,
                    u.activo
                FROM usuarios u
                JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.username = ? 
            `, [username]);

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario o contraseña incorrectos'
                });
            }

            const user = users[0];

            if (!user.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario inactivo. Contacte al administrador'
                });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);

            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario o contraseña incorrectos'
                });
            }

            // Login exitoso
            res.json({
                success: true,
                message: 'Inicio de sesión correcto',
                user: {
                    id: user.id_usuario,
                    username: user.username,
                    nombre: user.nombre_completo,
                    rol: user.rol
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
};

module.exports = authController;