const { getConnection } = require('../config/db');
const { Request, TYPES } = require('tedious');

class SolicitudModel {
    static async getAll(filtros = {}) {
        return new Promise((resolve, reject) => {
            const connection = getConnection();
            const solicitudes = [];
            
            let query = `SELECT * FROM solicitudes WHERE 1=1`;
            const params = [];

            if (filtros.estado) {
                query += ` AND estado_proceso = @estado`;
                params.push({ name: 'estado', type: TYPES.NVarChar, value: filtros.estado });
            }
            if (filtros.ingeniero) {
                query += ` AND ingeniero = @ingeniero`;
                params.push({ name: 'ingeniero', type: TYPES.NVarChar, value: filtros.ingeniero });
            }

            query += ` ORDER BY fecha_inicio DESC`;

            const request = new Request(query, (err) => {
                if (err) reject(err);
                connection.close();
                resolve(solicitudes);
            });

            params.forEach(p => {
                request.addParameter(p.name, p.type, p.value);
            });

            request.on('row', (columns) => {
                const solicitud = {};
                columns.forEach((column) => {
                    solicitud[column.metadata.colName] = column.value;
                });
                solicitudes.push(solicitud);
            });

            connection.on('connect', (err) => {
                if (err) reject(err);
                connection.execSql(request);
            });

            connection.connect();
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            const connection = getConnection();
            let solicitud = null;

            const request = new Request(
                'SELECT * FROM solicitudes WHERE id = @id',
                (err) => {
                    if (err) reject(err);
                    connection.close();
                    resolve(solicitud);
                }
            );

            request.addParameter('id', TYPES.Int, id);

            request.on('row', (columns) => {
                solicitud = {};
                columns.forEach((column) => {
                    solicitud[column.metadata.colName] = column.value;
                });
            });

            connection.on('connect', (err) => {
                if (err) reject(err);
                connection.execSql(request);
            });

            connection.connect();
        });
    }

    static async create(data) {
        return new Promise((resolve, reject) => {
            const connection = getConnection();

            const query = `
                INSERT INTO solicitudes (
                    ingeniero, cliente, localidad, departamento, direccion,
                    fecha_inicio, fecha_solicitud_ing, servicio, ab, medio,
                    nodo, numero_producto, observaciones, region, mes,
                    contratista, tipo_enlace, tipo_srv, isp, anio,
                    equipo, os, contacto, tel_contacto, vendedor, comentario,
                    estado_proceso
                ) VALUES (
                    @ingeniero, @cliente, @localidad, @departamento, @direccion,
                    @fecha_inicio, @fecha_solicitud_ing, @servicio, @ab, @medio,
                    @nodo, @numero_producto, @observaciones, @region, @mes,
                    @contratista, @tipo_enlace, @tipo_srv, @isp, @anio,
                    @equipo, @os, @contacto, @tel_contacto, @vendedor, @comentario,
                    @estado_proceso
                );
                SELECT SCOPE_IDENTITY() AS id;
            `;

            const request = new Request(query, (err) => {
                if (err) reject(err);
            });

            // Agregar parámetros
            Object.keys(data).forEach(key => {
                let type = TYPES.NVarChar;
                if (key.includes('fecha')) type = TYPES.DateTime;
                if (key === 'anio') type = TYPES.Int;
                
                request.addParameter(key, type, data[key] || null);
            });

            request.on('row', (columns) => {
                const id = columns[0].value;
                connection.close();
                resolve(id);
            });

            connection.on('connect', (err) => {
                if (err) reject(err);
                connection.execSql(request);
            });

            connection.connect();
        });
    }

    static async updateEstado(id, nuevoEstado) {
        return new Promise((resolve, reject) => {
            const connection = getConnection();

            // Obtener estado anterior
            this.getById(id).then(solicitud => {
                const estadoAnterior = solicitud.estado_proceso;

                const request = new Request(
                    `UPDATE solicitudes SET estado_proceso = @nuevoEstado 
                     WHERE id = @id;
                     
                     INSERT INTO historial_estados (solicitud_id, estado_anterior, estado_nuevo)
                     VALUES (@id, @estadoAnterior, @nuevoEstado);`,
                    (err) => {
                        if (err) reject(err);
                        connection.close();
                        resolve(true);
                    }
                );

                request.addParameter('id', TYPES.Int, id);
                request.addParameter('nuevoEstado', TYPES.NVarChar, nuevoEstado);
                request.addParameter('estadoAnterior', TYPES.NVarChar, estadoAnterior);

                connection.on('connect', (err) => {
                    if (err) reject(err);
                    connection.execSql(request);
                });

                connection.connect();
            }).catch(reject);
        });
    }

    static async getEstadisticas() {
        return new Promise((resolve, reject) => {
            const connection = getConnection();
            const estadisticas = {};

            const query = `
                SELECT 
                    estado_proceso,
                    COUNT(*) as cantidad,
                    (SELECT COUNT(*) FROM solicitudes WHERE YEAR(fecha_inicio) = 2026) as total_2026,
                    (SELECT COUNT(DISTINCT ingeniero) FROM solicitudes WHERE ingeniero != 'N/A') as ingenieros_activos
                FROM solicitudes
                GROUP BY estado_proceso
                UNION ALL
                SELECT 'TOTAL' as estado_proceso, COUNT(*) as cantidad, NULL, NULL
                FROM solicitudes
            `;

            const request = new Request(query, (err) => {
                if (err) reject(err);
                connection.close();
                resolve(estadisticas);
            });

            request.on('row', (columns) => {
                const estado = columns[0].value;
                const cantidad = columns[1].value;
                estadisticas[estado] = cantidad;
                
                if (columns[2] && columns[2].value) {
                    estadisticas.total_2026 = columns[2].value;
                }
                if (columns[3] && columns[3].value) {
                    estadisticas.ingenieros_activos = columns[3].value;
                }
            });

            connection.on('connect', (err) => {
                if (err) reject(err);
                connection.execSql(request);
            });

            connection.connect();
        });
    }
}

module.exports = SolicitudModel;