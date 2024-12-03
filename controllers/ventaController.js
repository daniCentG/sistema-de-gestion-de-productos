const Venta = require('../models/venta');
const Stock = require('../models/stock');

exports.agregarVenta = async (req, res) => {
    const { producto_id, cantidad, tipo_venta, cliente, fecha, precio_total } = req.body;
    
    try {
        // Verificamos el stock actual del producto
        // Obtenemos el producto para verificar el tipo de venta y el stock
        const producto = await Stock.obtenerProductoPorId(producto_id);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Validamos que el tipo de venta coincida
        if (producto.tipo_venta !== tipo_venta) {
            return res.status(400).json({ 
                message: `OJO: El producto "${producto.nombre}" solo puede venderse en ${producto.tipo_venta === 'kg' ? 'Kilogramos' : 'Unidades'}.` 
            });
        }

        // Verificamos stock disponible
        if (producto.stock_actual <= 0) {
            return res.status(400).json({ message: `OJO: El producto "${producto.nombre}" no tiene stock disponible` });
        }

        // Registramos la venta solo si hay suficiente stock
        const ventaId = await Venta.agregarVenta(producto_id, cantidad, tipo_venta, cliente, fecha, precio_total);
        
        res.status(201).json({ message: 'Venta agregada con éxito', ventaId });
    } catch (err) {
        console.error('Error agregando la venta:', err);
        res.status(500).json({ message: 'Error agregando la venta' });
    }
};

//Obtener ventas
exports.obtenerVentas = async (req, res) => {
    try {
        const ventas = await Venta.obtenerVentas();
        res.status(200).json(ventas);
    } catch (error) {
        console.error('Error obteniendo las ventas:', error);
        res.status(500).json({ message: 'Error obteniendo las ventas' });
    }
};
