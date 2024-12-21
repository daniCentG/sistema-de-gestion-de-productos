-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo_venta VARCHAR(50) NOT NULL CHECK (tipo_venta IN ('kg', 'unidad')),
    precio DECIMAL(10, 2) NOT NULL,
    stock_actual DECIMAL(10, 2) NOT NULL,
    stock_minimo DECIMAL(10, 2) NOT NULL,
    proveedor VARCHAR(255) NOT NULL
);

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    cantidad DECIMAL(10, 2) NOT NULL,
    tipo_venta VARCHAR(50) NOT NULL CHECK (tipo_venta IN ('kg', 'unidad')),
    cliente VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    precio_total DECIMAL(10, 2) NOT NULL
);

-- Tabla de Compras
CREATE TABLE IF NOT EXISTS compras (
    id SERIAL PRIMARY KEY,
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    cantidad DECIMAL(10, 2) NOT NULL,
    tipo_venta VARCHAR(50) NOT NULL CHECK (tipo_venta IN ('kg', 'unidad')),
    proveedor VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    precio_total DECIMAL(10, 2) NOT NULL
);

-- Tabla de Ordenes de Compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id SERIAL PRIMARY KEY,
    proveedor VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    total DECIMAL(10, 2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalle de Ordenes de Compra
CREATE TABLE IF NOT EXISTS detalle_orden_compra (
    id SERIAL PRIMARY KEY,
    orden_compra_id INT REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(id),
    cantidad DECIMAL(10, 2) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Tabla de Resumen
CREATE TABLE IF NOT EXISTS resumen (
    id SERIAL PRIMARY KEY,
    tipo_transaccion VARCHAR(50) NOT NULL,  -- 'compra' o 'venta'
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    cantidad DECIMAL(10, 2) NOT NULL,  -- Cantidad comprada o vendida
    tipo_venta VARCHAR(50) NOT NULL CHECK (tipo_venta IN ('kg', 'unidad')),
    precio_total DECIMAL(10, 2) NOT NULL,  -- Precio total de la transacción
    fecha DATE NOT NULL DEFAULT CURRENT_DATE  -- Fecha de la transacción
);


CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");

CREATE INDEX "IDX_session_expire" ON "session" ("expire");


CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'compras') THEN
        UPDATE productos 
        SET stock_actual = stock_actual + NEW.cantidad 
        WHERE id = NEW.producto_id;
        
        -- Actualizar el precio de compra si es diferente
        IF (SELECT precio FROM productos WHERE id = NEW.producto_id) <> NEW.precio_total / NEW.cantidad THEN
            UPDATE productos 
            SET precio = NEW.precio_total / NEW.cantidad 
            WHERE id = NEW.producto_id;
        END IF;
    ELSIF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'ventas') THEN
        UPDATE productos 
        SET stock_actual = stock_actual - NEW.cantidad 
        WHERE id = NEW.producto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- Crear o reemplazar el trigger para la tabla `compras`
DROP TRIGGER IF EXISTS trigger_actualizar_stock_compras ON compras;
CREATE TRIGGER trigger_actualizar_stock_compras
AFTER INSERT ON compras
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();

-- Crear o reemplazar el trigger para la tabla `ventas`
DROP TRIGGER IF EXISTS trigger_actualizar_stock_ventas ON ventas;
CREATE TRIGGER trigger_actualizar_stock_ventas
AFTER INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();


CREATE OR REPLACE FUNCTION registrar_resumen()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_TABLE_NAME = 'ventas') THEN
        INSERT INTO resumen (tipo_transaccion, producto_id, cantidad, tipo_venta, precio_total, fecha)
        VALUES ('venta', NEW.producto_id, NEW.cantidad, NEW.tipo_venta, NEW.precio_total, NEW.fecha);
    ELSIF (TG_TABLE_NAME = 'compras') THEN
        INSERT INTO resumen (tipo_transaccion, producto_id, cantidad, tipo_venta, precio_total, fecha)
        VALUES ('compra', NEW.producto_id, NEW.cantidad, NEW.tipo_venta, NEW.precio_total, NEW.fecha);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger para registrar resumen en ventas
CREATE TRIGGER trigger_registrar_resumen_ventas
AFTER INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION registrar_resumen();

-- Trigger para registrar resumen en compras
CREATE TRIGGER trigger_registrar_resumen_compras
AFTER INSERT ON compras
FOR EACH ROW
EXECUTE FUNCTION registrar_resumen();