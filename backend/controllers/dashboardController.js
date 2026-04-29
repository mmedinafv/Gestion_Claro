// backend/controllers/dashboardController.js
const pool = require('../config/db');

const dashboardController = {

    getResumen: async (req, res) => {
        try {
            // Estadísticas generales
            const [totales] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_solicitudes,
                    SUM(CASE WHEN estado_proceso IN ('Ing-en Proceso', 'FO-en Proceso-Instalacion') THEN 1 ELSE 0 END) as en_proceso,
                    SUM(CASE WHEN estado_proceso LIKE '%finalizada%' OR estado_proceso = 'Ing-lista y Aplicada' THEN 1 ELSE 0 END) as completadas,
                    SUM(CASE WHEN estado_proceso = 'Ing-No Elaborada' THEN 1 ELSE 0 END) as pendientes
                FROM nodos
            `);

            // Solicitudes por Ingeniero
            const [porIngeniero] = await pool.execute(`
                SELECT 
                    COALESCE(i.nombre, 'Sin Asignar') as ingeniero,
                    COUNT(*) as cantidad
                FROM nodos n
                LEFT JOIN ingenieros i ON n.ingeniero_asignado = i.id_ingeniero
                GROUP BY i.nombre
                ORDER BY cantidad DESC
                LIMIT 10
            `);

            // Estados de Solicitudes (Gráfico de Pastel)
            const [porEstado] = await pool.execute(`
                SELECT 
                    estado_proceso as estado,
                    COUNT(*) as cantidad
                FROM nodos
                GROUP BY estado_proceso
                ORDER BY cantidad DESC
            `);

            res.json({
                success: true,
                data: {
                    total_solicitudes: totales[0].total_solicitudes || 0,
                    en_proceso: totales[0].en_proceso || 0,
                    completadas: totales[0].completadas || 0,
                    pendientes: totales[0].pendientes || 0,
                    porIngeniero: porIngeniero,
                    porEstado: porEstado
                }
            });
        } catch (error) {
            console.error('❌ Error en dashboard:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = dashboardController;