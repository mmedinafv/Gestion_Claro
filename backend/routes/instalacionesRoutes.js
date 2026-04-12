const express = require('express');
const router = express.Router();
const instalacionesController = require('../controllers/instalacionesController');

router.get('/', instalacionesController.getAll);

module.exports = router;