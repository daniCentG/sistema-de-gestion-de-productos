// config/database.js
require('dotenv').config();
const { Pool } = require('pg');

// Crear un pool de conexiones para PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Desactiva SSL si estás trabajando localmente
});

// Mensaje de conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
  } else {
    console.log('Conexión a la base de datos exitosa');
    release();  // Liberar el cliente una vez conectado
  }
});

// Exportar el pool para ser utilizado en otros módulos
module.exports = pool;