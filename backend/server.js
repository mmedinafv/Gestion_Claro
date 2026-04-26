const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

console.log("✅ Servidor iniciando...");

// Controladores
const authController = require('./controllers/authController');
const dashboardController = require('./controllers/dashboardController');
const solicitudesController = require('./controllers/solicitudesController');
const instalacionesController = require('./controllers/instalacionesController');
const ingenierosController = require('./controllers/ingenierosController');
const combosController = require('./controllers/combosController');

// Rutas
app.post('/api/auth/login', authController.login);
app.get('/api/dashboard/resumen', dashboardController.getResumen);

app.get('/api/solicitudes', solicitudesController.getAll);
app.post('/api/solicitudes', solicitudesController.create);

app.get('/api/instalaciones', instalacionesController.getAll);

// Ingenieros CRUD
app.get('/api/ingenieros', ingenierosController.getAll);
app.post('/api/ingenieros', ingenierosController.create);
app.put('/api/ingenieros/:id', ingenierosController.update);
app.delete('/api/ingenieros/:id', ingenierosController.delete);

// Combos
app.get('/api/combos/sitios', combosController.getSitios);
app.get('/api/combos/medios', combosController.getMedios);
app.get('/api/combos/ingenieros', combosController.getIngenieros);

app.get('/', (req, res) => {
    res.json({ message: '✅ API Claro Honduras funcionando en puerto 5001' });
});

app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    await authController.createAdmin();
});