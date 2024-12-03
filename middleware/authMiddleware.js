module.exports = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    } else {
        // Redirigir al login si no está autenticado
        res.redirect('/');
    }
};
