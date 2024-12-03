// addUser.js
const bcrypt = require('bcrypt');
const pool = require('./config/database'); // Importar conexión a la base de datos

async function agregarUsuario(usuario, contraseña) {
    try {
        const hashedPassword = await bcrypt.hash(contraseña, 10); // Hashear la contraseña
        const query = 'INSERT INTO usuarios (usuario, contraseña) VALUES ($1, $2)';
        await pool.query(query, [usuario, hashedPassword]);
        console.log('Usuario agregado correctamente');
    } catch (error) {
        console.error('Error al agregar usuario:', error);
    }
}

//Ejemplo de como agregar usuarios y contraseña
// Llama a esta función para agregar usuarios
agregarUsuario('jedi', 'MaytheForcebewithyou'); // Reemplaza con el nombre de usuario y contraseña deseada
