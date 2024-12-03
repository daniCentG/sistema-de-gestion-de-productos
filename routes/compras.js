const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para agregar una compra
router.post('/agregar', authMiddleware, compraController.agregarCompra);

// Ruta para listar compras
router.get('/listar', authMiddleware, compraController.obtenerCompras);

module.exports = router;
