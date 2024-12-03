const db = require('../config/database');

exports.getResumen = async (req, res) => {
    try {
        const ventas = await db.query(`
            SELECT v.fecha, 'venta' AS tipo, p.nombre AS producto_nombre, v.cantidad, v.tipo_venta, v.precio_total
            FROM ventas v
            JOIN productos p ON v.producto_id = p.id
        `);

        const compras = await db.query(`
            SELECT c.fecha, 'compra' AS tipo, p.nombre AS producto_nombre, c.cantidad, c.tipo_venta, c.precio_total
            FROM compras c
            JOIN productos p ON c.producto_id = p.id
        `);

        // Combinar ventas y compras, ordenando por fecha
        const resumen = [...ventas.rows, ...compras.rows].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        res.status(200).json(resumen);
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ error: 'Error al obtener resumen' });
    }
};

