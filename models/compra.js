const pool = require('../config/database');

const Compra = {
    async agregarCompra(producto_id, cantidad, tipo_venta, proveedor, fecha, precio_total) {
        const query = 'INSERT INTO compras (producto_id, cantidad, tipo_venta, proveedor, fecha, precio_total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        const result = await pool.query(query, [producto_id, cantidad, tipo_venta, proveedor, fecha, precio_total]);
        return result.rows[0].id;
    },

    async obtenerCompras() {
        const query = `
            SELECT c.id, p.nombre AS producto_nombre, c.cantidad, c.tipo_venta, c.proveedor, c.fecha, c.precio_total 
            FROM compras c
            JOIN productos p ON c.producto_id = p.id
            ORDER BY c.fecha DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }
};

module.exports = Compra;
