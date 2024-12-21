// Función para obtener y mostrar el stock
function cargarStock() {
    fetch('/stock/listar')
        .then(response => response.json())
        .then(data => {
            const stockTableBody = document.getElementById('stock-table').getElementsByTagName('tbody')[0];
            stockTableBody.innerHTML = '';
            data.forEach(producto => {
                const fila = `
                    <tr>
                        <td>${producto.id}</td>
                        <td>${producto.nombre}</td>
                        <td>${producto.stock_actual}</td>
                        <td>Gs. ${producto.precio}</td>
                    </tr>
                `;
                stockTableBody.innerHTML += fila;
            });

            // Cargar alertas de stock bajo
            verificarStockBajo();

            // Cargar productos en los select de compra y venta
            cargarProductosEnSelect();


            //cargarProductosEnOrdenCompra();
        })
        .catch(error => console.error('Error cargando el stock:', error));
}


// Función para calcular el total en compras con validación
function calcularTotalCompra() {
    const cantidad = parseFloat(document.getElementById('cantidad').value);
    const precio = parseFloat(document.getElementById('precio').value);
    const totalInput = document.getElementById('total');
    const mensajeCompra = document.getElementById('mensaje-compra'); // Asume que tienes un contenedor para el mensaje

    // Validación: solo calcula si ambos valores son válidos
    if (cantidad > 0 && precio > 0) {
        totalInput.value = (cantidad * precio).toFixed(2);
        mensajeCompra.textContent = ''; // Limpia el mensaje de error
        totalInput.classList.remove('error'); // Remueve cualquier clase de error
    } else {
        totalInput.value = '';
        mensajeCompra.textContent = 'Cantidad y precio deben ser mayores que cero.'; // Mensaje en pantalla
        mensajeCompra.style.color = 'red';
    }
}

// Función para calcular el total en ventas con validación
function calcularTotalVenta() {
    const cantidad = parseFloat(document.getElementById('cantidad').value);
    const precio = parseFloat(document.getElementById('precio').value);
    const totalInput = document.getElementById('total');
    const mensajeVenta = document.getElementById('mensaje-venta'); // Asume que tienes un contenedor para mensajes de error

    // Validación: solo calcula si ambos valores son válidos
    if (cantidad > 0 && precio > 0) {
        totalInput.value = (cantidad * precio).toFixed(2);
        mensajeVenta.textContent = ''; // Limpia el mensaje de error si los valores son válidos
        totalInput.classList.remove('error'); // Remueve cualquier clase de error
    } else {
        totalInput.value = '';
        mensajeVenta.textContent = 'Cantidad y precio deben ser mayores que cero.'; // Muestra mensaje de error en pantalla
        mensajeVenta.style.color = 'red';
    }
}


// Asignamos la función de cálculo automático en el evento de entrada de cantidad o precio en compras
if (document.getElementById('compraForm')) {
    document.getElementById('cantidad').addEventListener('input', calcularTotalCompra);
    document.getElementById('precio').addEventListener('input', calcularTotalCompra);
}

// Asignamos la función de cálculo automático en el evento de entrada de cantidad o precio en ventas
if (document.getElementById('ventaForm')) {
    document.getElementById('cantidad').addEventListener('input', calcularTotalVenta);
    document.getElementById('precio').addEventListener('input', calcularTotalVenta);
}


// Función para verificar y mostrar stock bajo
function verificarStockBajo() {
    fetch('/stock/alertas')
        .then(response => response.json())
        .then(data => {
            const listaAlertas = document.getElementById('lista-alertas');
            listaAlertas.innerHTML = '';
            if (data.length === 0) {
                listaAlertas.innerHTML = '<li>No hay productos con stock bajo.</li>';
            } else {
                data.forEach(producto => {
                    const alerta = `<li>${producto.nombre} tiene stock bajo (${producto.stock_actual})</li>`;
                    listaAlertas.innerHTML += alerta;
                });
            }
        })
        .catch(error => console.error('Error verificando stock bajo:', error));
}

// Función para cargar productos en los selects de compra y venta
function cargarProductosEnSelect() {
    // Obtemos los selectores relevantes
    const productoSelectVenta = document.getElementById('producto');
    const productoSelectOrden = document.getElementById('producto-id');

    if (productoSelectVenta || productoSelectOrden) {
        // Realiza una solicitud al servidor para obtener la lista de productos
        fetch('/stock/listar')
            .then(response => response.json())
            .then(data => {
                // Esto genera las opciones con los datos recibidos
                const opciones = data.map(producto =>
                    `<option value="${producto.id}">${producto.nombre} (Disponible: ${producto.stock_actual})</option>`
                ).join('');

                //Esto actualiza el select de ventas si existe
                if (productoSelectVenta) {
                    productoSelectVenta.innerHTML = opciones;
                }

                // Esto actualiza el select de órdenes de compra si existe
                if (productoSelectOrden) {
                    productoSelectOrden.innerHTML = opciones;
                }
            })
            .catch(error => {
                // Loguea el error si ocurre un problema al cargar los datos
                console.error('Error cargando productos en los selects:', error);
            });
    }
}

// Función para registrar una venta
function registrarVenta() {
    const formVenta = document.getElementById('ventaForm');
    const mensajeVenta = document.getElementById('mensaje-venta');

    formVenta.addEventListener('submit', function (event) {
        event.preventDefault();

        const producto_id = formVenta.querySelector('#producto').value;
        const cantidad = parseFloat(formVenta.querySelector('#cantidad').value);
        const tipo_venta = formVenta.querySelector('#unidad-venta').value;
        const cliente = formVenta.querySelector('#cliente').value;
        const fecha = formVenta.querySelector('#fecha').value;
        const precio = parseFloat(formVenta.querySelector('#precio').value);
        const total = parseFloat(formVenta.querySelector('#total').value);

        // Validación de campos obligatorios y valores mayores a cero
        if (!producto_id || !tipo_venta || !cliente || !fecha || cantidad <= 0 || precio <= 0 || total <= 0) {
            mensajeVenta.textContent = 'Por favor, completa todos los campos y verifica que la cantidad y precio sean mayores que cero.';
            mensajeVenta.style.color = 'red';
            return;
        }

        const datosVenta = {
            producto_id: parseInt(producto_id),
            cantidad,
            tipo_venta,
            cliente,
            fecha,
            precio_total: total
        };

        fetch('/ventas/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosVenta)
        })
        .then(response => response.json())
            .then(data => {
                if (data.message) {
                    mensajeVenta.textContent = data.message;
                    mensajeVenta.style.color = 'green';
                    formVenta.reset(); // Reiniciar el formulario
                    cargarStock(); // Actualizar el stock después de la venta
                    cargarResumen(); // Actualizar el resumen
                }
            })
            .catch(error => {
                mensajeVenta.textContent = 'Error al registrar la venta.';
                mensajeVenta.style.color = 'red';
            });
    });
}

// Función para registrar una compra
function registrarCompra() {
    const formCompra = document.getElementById('compraForm');
    const mensajeCompra = document.getElementById('mensaje-compra');

    formCompra.addEventListener('submit', function (event) {
        event.preventDefault();

        const producto = formCompra.querySelector('#producto').value;
        const cantidad = parseFloat(formCompra.querySelector('#cantidad').value);
        const tipo_venta = formCompra.querySelector('#unidad-venta').value;
        const precio = parseFloat(formCompra.querySelector('#precio').value);
        const proveedor = formCompra.querySelector('#proveedor').value;
        const fecha = formCompra.querySelector('#fecha').value;
        const total = parseFloat(formCompra.querySelector('#total').value);

        // Validación de campos obligatorios y valores mayores a cero
        if (!producto || !tipo_venta || !proveedor || !fecha || cantidad <= 0 || precio <= 0 || total <= 0) {
            mensajeCompra.textContent = 'Por favor, completa todos los campos y verifica que la cantidad y precio sean mayores que cero.';
            mensajeCompra.style.color = 'red';
            return;
        }

        const datosCompra = {
            producto,
            cantidad,
            tipo_venta,
            proveedor,
            fecha,
            precio_total: total
        };

        fetch('/compras/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosCompra)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                mensajeCompra.textContent = data.message;
                mensajeCompra.style.color = 'green';
                formCompra.reset(); // Reiniciar el formulario
                cargarStock(); // Actualizar el stock después de la compra
                cargarResumen(); // Actualizar el resumen
                cargarProductosEnSelect(); // Actualizar productos en el select de ventas
            }
        })
        .catch(error => {
            mensajeCompra.textContent = 'Error al registrar la compra.';
            mensajeCompra.style.color = 'red';
        });  
        
    });
}

// Función para generar y descargar una orden de compra en PDF
function generarOrdenCompraPDF(datosOrden) {
    // Validar que los datos requeridos estén presentes
    if (!datosOrden || !datosOrden.proveedor || !datosOrden.fecha || !datosOrden.precio_total || 
        !datosOrden.producto_id || !datosOrden.cantidad || !datosOrden.tipo_venta) {
        console.error('Datos incompletos para generar la orden de compra en PDF:', datosOrden);
        return;
    }

    const { proveedor, fecha, precio_total, producto_id, cantidad, tipo_venta } = datosOrden;

    // OJO: Asegúramos acceder al constructor jsPDF desde el espacio global `window.jspdf`
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(16);
    doc.text('Orden de Compra', 20, 20);

    // Detalles de la orden
    doc.setFontSize(12);
    doc.text(`Proveedor: ${proveedor}`, 20, 40);
    doc.text(`Fecha: ${new Date(fecha).toLocaleDateString('es-ES')}`, 20, 50); // Formato de fecha más legible
    doc.text(`Producto ID: ${producto_id}`, 20, 60);
    doc.text(`Cantidad Necesaria: ${cantidad} ${tipo_venta === 'kg' ? 'Kg' : 'Unidades'}`, 20, 70);
    doc.text(`Precio Total: Gs. ${precio_total.toLocaleString('es-ES')}`, 20, 80); // Formatear números con separadores de miles

    // Pie de página
    doc.text('Gracias por su compra.', 20, 100);

    // Guardar el archivo PDF
    const nombreArchivo = `orden_compra_${new Date(fecha).toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
}


// Función para generar una orden de compra desde stock
function generarOrdenCompra() {
    const formOrdenCompra = document.getElementById('form-orden-compra');
    const mensajeStock = document.getElementById('mensaje-stock');

    // Verificar si el formulario existe
    if (!formOrdenCompra) {
        console.error('Formulario de orden de compra no encontrado');
        return;
    }

    formOrdenCompra.addEventListener('submit', function (event) {
        event.preventDefault();

        const producto_id = formOrdenCompra.querySelector('#producto-id').value;
        const cantidad_necesaria = parseFloat(formOrdenCompra.querySelector('#cantidad-necesaria').value);

        // Validar datos antes de enviar
        if (!producto_id || cantidad_necesaria <= 0) {
            mensajeStock.textContent = 'Por favor, completa todos los campos con valores válidos para generar la orden.';
            mensajeStock.style.color = 'red';
            console.log('Datos inválidos para enviar:', { producto_id, cantidad_necesaria });
            return;
        }

        const datosOrden = {
            producto_id: parseInt(producto_id),
            cantidad_necesaria
        };

        console.log('Datos enviados al servidor:', datosOrden); // Log para confirmar datos enviados

        fetch('/stock/generarOrdenCompra', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosOrden)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Respuesta del servidor:', data); // Log para verificar respuesta
            if (data.message && data.ordenCompraId) {
                mensajeStock.textContent = data.message;
                mensajeStock.style.color = 'green';

                generarOrdenCompraPDF({
                    proveedor: data.proveedor,
                    fecha: data.fecha,
                    precio_total: data.precio_total,
                    producto_id: datosOrden.producto_id,
                    cantidad: datosOrden.cantidad_necesaria,
                    tipo_venta: data.tipo_venta
                });

                formOrdenCompra.reset();
            } else {
                mensajeStock.textContent = data.message || 'Error inesperado al generar la orden.';
                mensajeStock.style.color = 'red';
            }
            })
        .catch(error => {
            mensajeStock.textContent = 'Error al generar la orden de compra.';
            mensajeStock.style.color = 'red';
            console.error('Error en el fetch:', error); // Log para capturar errores
        });
    });
}

// Función para cargar el resumen
let resumenData = []; // Para almacenar los datos cargados
function cargarResumen() {
    fetch('/resumen/')
        .then(response => response.json())
        .then(data => {
            resumenData = data; // Guardar los datos cargados
            renderResumen(resumenData); // Mostrar los datos en la tabla
            calcularTotales(resumenData); // Calcular y mostrar los totales
        })
        .catch(error => console.error('Error cargando el resumen:', error));
}

// Función para renderizar el resumen en la tabla
function renderResumen(data) {
    const resumenTablaBody = document.getElementById('resumen-table').getElementsByTagName('tbody')[0];
    resumenTablaBody.innerHTML = '';

    data.forEach(item => {
        const fila = `
            <tr>
                <td>${item.fecha}</td>
                <td>${item.tipo === 'venta' ? 'Venta' : 'Compra'}</td>
                <td>${item.producto_nombre}</td>
                <td>${item.cantidad} ${item.tipo_venta === 'kg' ? 'Kilogramos' : 'Unidades'}</td>
                <td>Gs. ${item.precio_total.toLocaleString('es-ES')}</td>
            </tr>
        `;
        resumenTablaBody.innerHTML += fila;
    });
}

// Función para calcular y mostrar los totales de ventas y compras
function calcularTotales(data) {
    let totalVentas = 0;
    let totalCompras = 0;

    data.forEach(item => {
        if (item.tipo === 'venta') {
            totalVentas += parseFloat(item.precio_total);
        } else if (item.tipo === 'compra') {
            totalCompras += parseFloat(item.precio_total);
        }
    });

    document.getElementById('total-ventas').textContent = `Gs. ${totalVentas.toLocaleString('es-ES')}`;
    document.getElementById('total-compras').textContent = `Gs. ${totalCompras.toLocaleString('es-ES')}`;
}

// Función para manejar el ordenamiento
function ordenarResumen(columna, orden) {
    resumenData.sort((a, b) => {
        let aValue = a[columna];
        let bValue = b[columna];

        // Convertir fechas a objetos Date para comparación
        if (columna === 'fecha') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        // Convertir cantidad y precio_total a números para comparación
        if (columna === 'cantidad' || columna === 'precio_total') {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        }

        // Convertir tipo a valores comparables
        if (columna === 'tipo') {
            aValue = aValue === 'venta' ? 1 : 2;
            bValue = bValue === 'venta' ? 1 : 2;
        }

        if (orden === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? -1 : 1;
        }
    });

    renderResumen(resumenData);
    calcularTotales(resumenData); // Recalcular los totales después de ordenar
}

// Función para manejar el login
function manejarLogin() {
    const formLogin = document.getElementById('loginForm');
    const message = document.querySelector('.message');

    formLogin.addEventListener('submit', function (event) {
        event.preventDefault();

        const usuario = formLogin.querySelector('#usuario').value;
        const contraseña = formLogin.querySelector('#contraseña').value;

        fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, contraseña })
        })
        
        .then(response => {
            // Manejar la respuesta en función del código de estado
            if (response.status === 200) {
                return response.json(); // Si el login es exitoso
            } else if (response.status === 403) {
                // Usuario o contraseña incorrectos
                throw new Error('Usuario o contraseña incorrecto');
            } else if (response.status === 429) {
                // Límite de intentos alcanzado
                throw new Error('Demasiados intentos de inicio de sesión. Inténtalo en 15 minutos.');
            } else {
                // Otros errores
                throw new Error('Error en el servidor. Inténtalo más tarde.');
            }
        })

        .then(data => {
            if (data.message === 'Inicio de sesión exitoso') {
                window.location.href = '/index.html';
            } else {
                throw new Error(data.message || 'Error en el inicio de sesión.');
            }
        })
        .catch(error => {
            message.textContent = error.message;
            message.style.color = 'red';
        });
        
    });
}

// Función para manejar el logout
function manejarLogout() {
    const logoutButton = document.querySelector('.logout-button');

    if (logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault();
            fetch('/auth/logout', {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Sesión cerrada') {
                        window.location.href = 'login.html'; // Redirigir al login
                    }
                })
                .catch(error => console.error('Error al cerrar sesión:', error));
        });
    }
}

// Función principal para inicializar las funcionalidades
function iniciar() {
    if (document.getElementById('ventaForm')) {
        registrarVenta();
        cargarProductosEnSelect();  // Cargamos los productos disponibles al abrir la página de ventas
    }

    if (document.getElementById('compraForm')) {
        registrarCompra();
    }

    if (document.getElementById('stock-table')) {
        cargarStock();
    }

    if (document.getElementById('resumen-table')) {
        cargarResumen();
        // Agregar eventos a los botones de ordenamiento
        const botonesOrdenar = document.querySelectorAll('.sort-btn');
        botonesOrdenar.forEach(boton => {
            boton.addEventListener('click', () => {
                const columna = boton.dataset.col;
                const orden = boton.dataset.order;

                ordenarResumen(columna, orden);

                // Alternar el orden para el siguiente clic
                boton.dataset.order = orden === 'asc' ? 'desc' : 'asc';
                boton.textContent = orden === 'asc' ? '↓' : '↑';
            });
        });

    }

    if (document.getElementById('loginForm')) {
        manejarLogin();
    }

    // Inicializar la lógica de generar orden de compra
    if (document.getElementById('form-orden-compra')) {
        generarOrdenCompra();
    }

    manejarLogout();

}

// Llamar a la función para inicializar el script cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', iniciar);