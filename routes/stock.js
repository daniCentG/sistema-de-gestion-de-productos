const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para listar productos
router.get('/listar', authMiddleware, stockController.obtenerProductos);

// Ruta para actualizar stock
router.post('/actualizar', authMiddleware, stockController.actualizarStock);

// Ruta para verificar stock bajo
router.get('/alertas', authMiddleware, stockController.verificarStockBajo);

// Ruta para generar orden de compra
router.post('/generarOrdenCompra', authMiddleware, stockController.generarOrdenCompra);

module.exports = router;