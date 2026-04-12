// backend/controllers/combosController.js
const NodoModel = require('../models/nodoModel');

const combosController = {

    getSitios: async (req, res) => {
        try {
            const sitios = await NodoModel.getSitios();
            res.json({ success: true, data: sitios });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getMedios: async (req, res) => {
        try {
            const medios = await NodoModel.getMedios();
            res.json({ success: true, data: medios });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getIngenieros: async (req, res) => {
        try {
            const ingenieros = await NodoModel.getIngenieros();
            res.json({ success: true, data: ingenieros });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = combosController;