const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para agregar una venta
router.post('/agregar', authMiddleware, ventaController.agregarVenta);

// Ruta para listar ventas
router.get('/listar', authMiddleware, ventaController.obtenerVentas);

module.exports = router;