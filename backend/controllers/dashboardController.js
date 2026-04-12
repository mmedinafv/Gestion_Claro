const NodoModel = require('../models/nodoModel');

const dashboardController = {
    getResumen: async (req, res) => {
        try {
            const data = await NodoModel.getEstadisticas();
            res.json({
                success: true,
                data: {
                    total_solicitudes: data.totales.total_solicitudes || 0,
                    en_proceso: data.totales.en_proceso || 0,
                    completadas: data.totales.completadas || 0,
                    pendientes: data.totales.pendientes || 0,
                    porEstado: data.porEstado || []
                }
            });
        } catch (error) {
            console.error('Error en dashboardController:', error);
            res.status(500).json({ success: false, message: 'Error al obtener dashboard' });
        }
    }
};

module.exports = dashboardController;