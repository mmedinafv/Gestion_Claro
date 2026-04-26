const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const authController = {

    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
            }

            const [users] = await pool.execute(`
                SELECT u.id_usuario, u.username, u.password_hash, u.nombre_completo, 
                       r.nombre_rol as rol 
                FROM usuarios u 
                JOIN roles r ON u.id_rol = r.id_rol 
                WHERE u.username = ? AND u.activo = TRUE
            `, [username]);

            if (users.length === 0) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });

            const user = users[0];
            const valid = await bcrypt.compare(password, user.password_hash);

            if (!valid) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });

            res.json({
                success: true,
                user: {
                    id: user.id_usuario,
                    username: user.username,
                    nombre: user.nombre_completo,
                    rol: user.rol
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    },

    createAdmin: async () => {
        try {
            const [exist] = await pool.execute("SELECT id_usuario FROM usuarios WHERE username = 'admin'");
            if (exist.length > 0) return;

            const hash = await bcrypt.hash('1234', 10);
            await pool.execute(`
                INSERT INTO usuarios (username, password_hash, nombre_completo, id_rol, activo)
                VALUES ('admin', ?, 'Administrador General', 1, TRUE)
            `, [hash]);
            console.log('👤 Admin creado: admin / 1234');
        } catch (e) { console.error(e); }
    }
};

module.exports = authController;