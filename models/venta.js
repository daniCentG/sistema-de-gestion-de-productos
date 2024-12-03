const pool = require('../config/database');

const Venta = {
    async agregarVenta(producto_id, cantidad, tipo_venta, cliente, fecha, precio_total) {
        const query = 'INSERT INTO ventas (producto_id, cantidad, tipo_venta, cliente, fecha, precio_total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        const result = await pool.query(query, [producto_id, cantidad, tipo_venta, cliente, fecha, precio_total]);
        return result.rows[0].id;
    },

    async obtenerVentas() {
        const query = `
            SELECT v.id, p.nombre AS producto_nombre, v.cantidad, v.tipo_venta, v.cliente, v.fecha, v.precio_total 
            FROM ventas v
            JOIN productos p ON v.producto_id = p.id
            ORDER BY v.fecha DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }
};

module.exports = Venta;
