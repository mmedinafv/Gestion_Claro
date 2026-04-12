// backend/server.js - Versión SIMPLE y FUNCIONAL
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

console.log("✅ Servidor iniciando...");

// ==================== RUTAS DIRECTAS (sin archivos separados) ====================

// Dashboard
app.get('/api/dashboard/resumen', async (req, res) => {
    try {
        const NodoModel = require('./models/nodoModel');
        const data = await NodoModel.getEstadisticas();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Solicitudes
app.get('/api/solicitudes', async (req, res) => {
    try {
        const NodoModel = require('./models/nodoModel');
        const data = await NodoModel.getAllSolicitudes(req.query);
        res.json({ success: true, data, total: data.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/solicitudes', async (req, res) => {
    try {
        const NodoModel = require('./models/nodoModel');
        const id = await NodoModel.createSolicitud(req.body);
        res.status(201).json({ success: true, message: 'Solicitud creada', id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Instalaciones
app.get('/api/instalaciones', async (req, res) => {
    try {
        const NodoModel = require('./models/nodoModel');
        const data = await NodoModel.getAllInstalaciones(req.query);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Combos
app.get('/api/combos/sitios', async (req, res) => {
    try {
        const NodoModel = require('./models/nodoModel');
        const data = await NodoModel.getSitios();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/combos/medios', async (req, res) => {
    try {
        const NodoModel = require('./models/nodoModel');
        const data = await NodoModel.getMedios();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/combos/ingenieros', async (req, res) => {
    try {
        const NodoModel = require('./models/nodoModel');
        const data = await NodoModel.getIngenieros();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ message: '✅ API funcionando correctamente - Claro Honduras' });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📌 Prueba: http://localhost:${PORT}/api/solicitudes`);
});