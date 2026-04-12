// backend/routes/ingenierosRoutes.js
const express = require('express');
const router = express.Router();
const ingenierosController = require('../controllers/ingenierosController');

router.get('/', ingenierosController.getAll);
router.post('/', ingenierosController.create);

module.exports = router;