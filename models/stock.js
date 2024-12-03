const pool = require('../config/database');

const Stock = {
    async obtenerProductos() {
        const query = 'SELECT * FROM productos';
        const result = await pool.query(query);
        return result.rows;
    },

    //método para obtener un producto específico por ID
    async obtenerProductoPorId(producto_id) {
        const query = 'SELECT * FROM productos WHERE id = $1';
        const result = await pool.query(query, [producto_id]);
        return result.rows[0];
    },

    async actualizarStock(producto_id, cantidad, tipo) {
        if (tipo === 'compra') {
            const query = 'UPDATE productos SET stock_actual = stock_actual + $1 WHERE id = $2';
            return pool.query(query, [cantidad, producto_id]);
        } else if (tipo === 'venta') {
            const query = 'UPDATE productos SET stock_actual = stock_actual - $1 WHERE id = $2';
            return pool.query(query, [cantidad, producto_id]);
        }
    },

    async verificarStockBajo() {
        const query = 'SELECT * FROM productos WHERE stock_actual < stock_minimo';
        const result = await pool.query(query);
        return result.rows;
    }
};

module.exports = Stock;
