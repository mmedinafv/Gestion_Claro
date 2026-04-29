// controllers/combosController.js
const pool = require('../config/db');

const combosController = {

    getMedios: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT id_medio, nombre_medio 
                FROM medios 
                WHERE activo = TRUE 
                ORDER BY nombre_medio
            `);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('Error getMedios:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getIngenieros: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT id_ingeniero, nombre 
                FROM ingenieros 
                WHERE activo = TRUE 
                ORDER BY nombre
            `);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('Error getIngenieros:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = combosController;