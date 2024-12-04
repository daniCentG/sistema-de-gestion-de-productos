const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');

exports.login = async (req, res) => {
    const { usuario, contraseña } = req.body;
    
    try {
        // Buscar usuario en la base de datos
        const user = await Usuario.encontrarPorUsuario(usuario);
        if (!user) {
            return res.status(403).json({ message: 'Usuario o contraseña incorrectos' });
        }

        // Comparar contraseña ingresada con la almacenada
        const match = await bcrypt.compare(contraseña, user.contraseña);
        if (!match) {
            return res.status(403).json({ message: 'Usuario o contraseña incorrectos' });
        }

        // Establecer sesión y autenticación
        req.session.userId = user.id;
        req.session.isAuthenticated = true;

        res.json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error en el servidor. Inténtalo de nuevo más tarde.' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        res.clearCookie('connect.sid'); // Eliminar cookie de sesión en el cliente
        res.json({ message: 'Sesión cerrada' });
    });
};
