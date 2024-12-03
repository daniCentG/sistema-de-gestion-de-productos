const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Esta es la Ruta para el login
router.post('/login', authController.login);

// Esta es la Ruta para el logout
router.post('/logout', authController.logout);

module.exports = router;
