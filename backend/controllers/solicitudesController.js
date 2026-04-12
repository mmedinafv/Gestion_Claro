const NodoModel = require('../models/nodoModel');

const solicitudesController = {
    getAll: async (req, res) => {
        try {
            const filtros = req.query;
            const solicitudes = await NodoModel.getAllSolicitudes(filtros);
            res.json({
                success: true,
                data: solicitudes,
                total: solicitudes.length
            });
        } catch (error) {
            console.error('Error en solicitudesController.getAll:', error);
            res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
        }
    },

    create: async (req, res) => {
        try {
            const id = await NodoModel.createSolicitud(req.body);
            res.status(201).json({
                success: true,
                message: 'Solicitud creada exitosamente',
                id: id
            });
        } catch (error) {
            console.error('Error en solicitudesController.create:', error);
            res.status(500).json({ success: false, message: 'Error al crear solicitud' });
        }
    }
};

module.exports = solicitudesController;