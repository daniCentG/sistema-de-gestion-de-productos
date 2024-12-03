const db = require('../config/database');

const getVentas = async () => {
    const result = await db.query('SELECT * FROM ventas');
    return result.rows;
};

const getCompras = async () => {
    const result = await db.query('SELECT * FROM compras');
    return result.rows;
};

module.exports = {
    getVentas,
    getCompras,
};
