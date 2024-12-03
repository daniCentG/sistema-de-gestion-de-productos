const express = require('express');
const router = express.Router();
const resumenController = require('../controllers/resumenController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para obtener resumen
router.get('/', authMiddleware, resumenController.getResumen);

module.exports = router;
