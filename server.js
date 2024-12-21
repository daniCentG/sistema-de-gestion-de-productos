const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const pool = require('./config/database'); // Conexión a PostgreSQL

// Importamos rutas
const authRoutes = require('./routes/auth');
const ventaRoutes = require('./routes/ventas');
const compraRoutes = require('./routes/compras');
const stockRoutes = require('./routes/stock');
const resumenRoutes = require('./routes/resumen');

// Importamos el middleware de autenticación
const authMiddleware = require('./middleware/authMiddleware');

// Inicializamos la app
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de sesiones
app.use(session({
    store: new pgSession({ pool: pool }), 
    secret: process.env.SESSION_SECRET || 'aqui-tu-clave-secreta-segura-en-local', //Toma la otra clave('clave-secreta-segura-en-local') si estamos trabajando en local 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Activado solo en producción desde el .env
        httpOnly: true, // Evita acceso de scripts
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
        //maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Middleware para archivos estáticos (HTML, CSS, JS)
app.use(express.static('public')); // Sirve archivos estáticos (HTML, CSS, JS)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Redirigir al login si no está autenticado
app.get('/', (req, res) => {
    if (req.session.isAuthenticated) {
        res.redirect('/index.html');
    } else {
        // Si no está autenticado, envía el archivo login.html
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// Rutas de autenticación
app.use('/auth', require('./routes/auth'));


// Ruta protegida para index.html
app.get('/index.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas protegidas por autenticación
app.use('/ventas', authMiddleware, ventaRoutes);
app.use('/compras', authMiddleware, compraRoutes);
app.use('/stock', authMiddleware, stockRoutes);
app.use('/resumen', authMiddleware, resumenRoutes);

// Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});