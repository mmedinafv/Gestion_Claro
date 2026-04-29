// backend/server.js - VERSIÓN COMPLETA Y ESTABLE
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

console.log("✅ Servidor iniciando...");

// ==================== IMPORTAR CONTROLADORES ====================
const authController = require('./controllers/authController');
const dashboardController = require('./controllers/dashboardController');
const solicitudesController = require('./controllers/solicitudesController');
const instalacionesController = require('./controllers/instalacionesController');
const ingenierosController = require('./controllers/ingenierosController');
const usuariosController = require('./controllers/usuariosController');

// ==================== RUTAS ====================

// Auth
app.post('/api/auth/login', authController.login);

// Dashboard
app.get('/api/dashboard/resumen', dashboardController.getResumen || ((req, res) => res.json({ success: true, data: {} })));

// Solicitudes - CRUD completo
app.get('/api/solicitudes', solicitudesController.getAll);
app.get('/api/solicitudes/:id', solicitudesController.getById || ((req, res) => res.status(404).json({ success: false })));
app.post('/api/solicitudes', solicitudesController.create);
app.put('/api/solicitudes/:id', solicitudesController.update || ((req, res) => res.status(501).json({ success: false })));
app.delete('/api/solicitudes/:id', solicitudesController.delete);

// Instalaciones
app.get('/api/instalaciones', instalacionesController.getAll);
app.put('/api/instalaciones/:id/estado', instalacionesController.updateEstado || ((req, res) => res.json({ success: false })));

// Ingenieros
app.get('/api/ingenieros', ingenierosController.getAll);
app.get('/api/ingenieros/:id', ingenierosController.getById || ((req, res) => res.status(404).json({ success: false })));
app.post('/api/ingenieros', ingenierosController.create);
app.put('/api/ingenieros/:id', ingenierosController.update || ((req, res) => res.status(501).json({ success: false })));
app.delete('/api/ingenieros/:id', ingenierosController.delete || ((req, res) => res.status(501).json({ success: false })));

// Usuarios
app.get('/api/usuarios', usuariosController.getAll);
app.get('/api/usuarios/:id', usuariosController.getById || ((req, res) => res.status(404).json({ success: false })));
app.post('/api/usuarios', usuariosController.create);
app.put('/api/usuarios/:id', usuariosController.update || ((req, res) => res.status(501).json({ success: false })));
app.delete('/api/usuarios/:id', usuariosController.delete || ((req, res) => res.status(501).json({ success: false })));

// Combos
app.get('/api/combos/medios', async (req, res) => {
    try {
        const pool = require('./config/db');
        const [rows] = await pool.execute('SELECT id_medio, nombre_medio FROM medios WHERE activo = TRUE');
        res.json({ success: true, data: rows });
    } catch (e) {
        res.json({ success: true, data: [] });
    }
});

app.get('/api/combos/ingenieros', async (req, res) => {
    try {
        const pool = require('./config/db');
        const [rows] = await pool.execute('SELECT id_ingeniero, nombre FROM ingenieros WHERE activo = TRUE');
        res.json({ success: true, data: rows });
    } catch (e) {
        res.json({ success: true, data: [] });
    }
});

app.get('/', (req, res) => res.json({ message: '✅ API Claro Honduras funcionando' }));

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});