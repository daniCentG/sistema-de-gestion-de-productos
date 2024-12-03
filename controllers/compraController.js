const Compra = require('../models/compra');
const Stock = require('../models/stock');
const pool = require('../config/database');  // Importa la conexión a la base de datos

// Función para agregar una compra
exports.agregarCompra = async (req, res) => {

    const { producto, cantidad, tipo_venta, proveedor, fecha, precio_total } = req.body;

    // Validamos que todos los campos estén presentes
    if (!producto || !cantidad || !tipo_venta || !proveedor || !fecha || !precio_total) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificamos si el producto ya existe en la base de datos
        const productoQuery = 'SELECT id FROM productos WHERE nombre = $1';
        const result = await pool.query(productoQuery, [producto]);

        let producto_id;

        if (result.rows.length === 0) {
            // Si el producto no existe, agregarlo a la base de datos
            const stock_minimo = 10; // Asigna un valor adecuado para stock_minimo - OJO: Se debe verificar el campo stock_minimo de la base de datos
                                    // Porque debe ser igual al tipo de valor configurado en ese campo(en este caso nonull(10).

            const insertarProductoQuery = `
                INSERT INTO productos (nombre, tipo_venta, precio, stock_actual, stock_minimo, proveedor)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
            `;
            const nuevoProducto = await pool.query(insertarProductoQuery, [
                producto, 
                tipo_venta, 
                precio_total / cantidad, // Precio unitario calculado
                0,                       // Stock inicial
                stock_minimo,            // Stock mínimo
                proveedor
            ]);
            producto_id = nuevoProducto.rows[0].id;

        } else {
            // Si el producto existe, obtener su ID
            producto_id = result.rows[0].id;
        }

        // Registrar la compra en la base de datos
        const compraId = await Compra.agregarCompra(producto_id, cantidad, tipo_venta, proveedor, fecha, precio_total);

        res.status(201).json({ message: 'Compra agregada con éxito', compraId });

    } catch (err) {
        console.error('Error agregando la compra, verifícalo de nuevo:', err);
        res.status(500).json({ message: 'Error agregando la compra, verifícalo de nuevo' });
    }
};


// Función para obtener todas las compras
exports.obtenerCompras = async (req, res) => {
    try {
        // Obtenemos todas las compras de la base de datos
        const compras = await Compra.obtenerCompras();
        res.status(200).json(compras);
    } catch (err) {
        console.error('Error obteniendo las compras:', err);
        res.status(500).json({ message: 'Error obteniendo las compras' });
    }
};

