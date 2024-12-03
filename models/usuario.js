const pool = require('../config/database');

const Usuario = {
    async agregarUsuario(usuario, contraseñaHasheada) {
        const query = 'INSERT INTO usuarios (usuario, contraseña) VALUES ($1, $2)';
        return pool.query(query, [usuario, contraseñaHasheada]);
    },

    async encontrarPorUsuario(usuario) {
        const query = 'SELECT * FROM usuarios WHERE usuario = $1';
        const result = await pool.query(query, [usuario]);
        return result.rows[0];
    }
};

module.exports = Usuario;
