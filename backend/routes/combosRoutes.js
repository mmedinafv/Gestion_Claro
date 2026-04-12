const express = require('express');
const router = express.Router();
const combosController = require('./controllers/combosController');

router.get('/sitios', combosController.getSitios);
router.get('/medios', combosController.getMedios);
router.get('/ingenieros', combosController.getIngenieros);

module.exports = router;