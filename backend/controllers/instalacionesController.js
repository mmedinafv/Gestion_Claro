const NodoModel = require('../models/nodoModel');

const instalacionesController = {
    getAll: async (req, res) => {
        try {
            const filtros = {
                medio: req.query.medio,
                search: req.query.search || req.query['search-instalacion']
            };
            const instalaciones = await NodoModel.getAllInstalaciones(filtros);
            res.json({
                success: true,
                data: instalaciones
            });
        } catch (error) {
            console.error('Error en instalacionesController:', error);
            res.status(500).json({ success: false, message: 'Error al obtener instalaciones' });
        }
    }
};

module.exports = instalacionesController;