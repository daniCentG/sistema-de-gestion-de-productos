const Stock = require('../models/stock'); 
const OrdenCompra = require('../models/ordenCompra');

exports.obtenerProductos = async (req, res) => {
    try {
        const productos = await Stock.obtenerProductos();
        res.status(200).json(productos);
    } catch (err) {
        console.error('Error obteniendo productos:', err);
        res.status(500).json({ message: 'Error obteniendo productos' });
    }
};

exports.actualizarStock = async (req, res) => {
    const { idProducto, cantidad, tipo } = req.body;

    if (!idProducto || !cantidad || !tipo) {
        return res.status(400).json({ message: 'Datos incompletos para actualizar stock' });
    }

    try {
        await Stock.actualizarStock(idProducto, cantidad, tipo);
        res.status(200).json({ message: 'Stock actualizado con éxito' });
    } catch (err) {
        console.error('Error actualizando stock:', err);
        res.status(500).json({ message: 'Error actualizando stock' });
    }
};

exports.verificarStockBajo = async (req, res) => {
    try {
        const productosBajoStock = await Stock.verificarStockBajo();
        res.status(200).json(productosBajoStock);
    } catch (err) {
        console.error('Error verificando stock bajo:', err);
        res.status(500).json({ message: 'Error verificando stock bajo' });
    }
};

exports.generarOrdenCompra = async (req, res) => {
    const { producto_id, cantidad_necesaria } = req.body;

    // Validación inicial
    if (!producto_id || !cantidad_necesaria || cantidad_necesaria <= 0) {
        console.log('Datos inválidos recibidos en el servidor:', { producto_id, cantidad_necesaria });
        return res.status(400).json({ message: 'Datos incompletos o inválidos para generar la orden de compra' });
    }

    try {
        const producto = await Stock.obtenerProductoPorId(producto_id);

        if (!producto) {
            console.log('Producto no encontrado:', producto_id);
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const precio_estimado = producto.precio * cantidad_necesaria;

        const ordenCompraId = await OrdenCompra.crearOrdenCompra(producto_id, cantidad_necesaria, precio_estimado);

        console.log('Orden de compra creada con éxito:', ordenCompraId);

        res.status(201).json({
            message: 'Orden de compra generada con éxito',
            ordenCompraId,
            proveedor: producto.proveedor,
            fecha: new Date().toISOString().split('T')[0],
            tipo_venta: producto.tipo_venta,
            precio_total: precio_estimado
        });
    } catch (err) {
        console.error('Error generando la orden de compra:', err);
        res.status(500).json({ message: 'Error generando la orden de compra', error: err.message });
    }
};