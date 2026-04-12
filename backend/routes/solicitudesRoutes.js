const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudesController');

router.get('/', solicitudesController.getAll);
router.post('/', solicitudesController.create);

module.exports = router;