const pool = require('../config/database');

const OrdenCompra = {
    async crearOrdenCompra(producto_id, cantidad_necesaria, precio_estimado) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Obtener el proveedor del producto
            const productoQuery = 'SELECT proveedor FROM productos WHERE id = $1';
            const productoResult = await client.query(productoQuery, [producto_id]);
            if (productoResult.rows.length === 0) {
                throw new Error('Proveedor no encontrado para el producto');
            }
            const proveedor = productoResult.rows[0].proveedor;

            // Crear la orden de compra
            const fecha = new Date().toISOString().split('T')[0];
            const ordenCompraQuery = `
                INSERT INTO ordenes_compra (proveedor, fecha, total)
                VALUES ($1, $2, $3)
                RETURNING id
            `;
            const ordenCompraResult = await client.query(ordenCompraQuery, [proveedor, fecha, precio_estimado]);
            const ordenCompraId = ordenCompraResult.rows[0].id;

            // Insertar los detalles de la orden de compra
            const detalleOrdenQuery = `
                INSERT INTO detalle_orden_compra (orden_compra_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(detalleOrdenQuery, [ordenCompraId, producto_id, cantidad_necesaria, precio_estimado / cantidad_necesaria, precio_estimado]);

            await client.query('COMMIT');
            return ordenCompraId;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error al crear la orden de compra:', err);
            throw err;
        } finally {
            client.release();
        }
    }
};

module.exports = OrdenCompra;
