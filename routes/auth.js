const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


const rateLimit = require('express-rate-limit');

// Configuración del límite de intentos para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // Máximo 3 intentos de inicio de sesión
    message: 'Demasiados intentos de inicio de sesión. Inténtalo en 15 minutos.'
});

// Esta es la Ruta para el login
router.post('/login', loginLimiter, authController.login);

// Esta es la Ruta para el logout
router.post('/logout', authController.logout);


module.exports = router;