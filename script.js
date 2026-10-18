
const formProducto = document.getElementById("formProducto");
const formVenta = document.getElementById("formVenta");

const tablaProductos = document.getElementById("tablaProductos");
const tablaVentas = document.getElementById("tablaVentas");
const productoVenta = document.getElementById("productoVenta");

const totalVendido = document.getElementById("totalVendido");
const cantidadVentas = document.getElementById("cantidadVentas");


const productos = JSON.parse(localStorage.getItem("productos")) || [];
const ventas = JSON.parse(localStorage.getItem("ventas")) || [];


function guardarDatos() {
    localStorage.setItem("productos", JSON.stringify(productos));
    localStorage.setItem("ventas", JSON.stringify(ventas));
}


function formatearPrecio(valor) {
    return valor.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });
}

// Mostrar los productos en la tabla y en el selector de ventas
function mostrarProductos() {
    tablaProductos.innerHTML = "";
    productoVenta.innerHTML = "";

    if (productos.length === 0) {
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="3">Todavía no hay productos.</td>
            </tr>
        `;

        productoVenta.innerHTML = `
            <option value="">Primero registra un producto</option>
        `;
        return;
    }

    productos.forEach((producto, indice) => {
        
const fila = document.createElement("tr");

fila.innerHTML = `
    <td></td>
    <td>${formatearPrecio(producto.precio)}</td>
    <td>${producto.stock}</td>
    <td>
        <button type="button" class="btn-editar">Editar</button>
        <button type="button" class="btn-eliminar">Eliminar</button>
    </td>
`;

fila.cells[0].textContent = producto.nombre;

fila.querySelector(".btn-editar").addEventListener("click", function() {
    editarProducto(indice);
});

fila.querySelector(".btn-eliminar").addEventListener("click", function() {
    eliminarProducto(indice);
});

tablaProductos.appendChild(fila);


        const opcion = document.createElement("option");
        opcion.value = indice;
        opcion.textContent =
            `${producto.nombre} - ${formatearPrecio(producto.precio)} (Stock: ${producto.stock})`;

        productoVenta.appendChild(opcion);
    });
}

// Registrar un producto
formProducto.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombreProducto").value.trim();
    const precio = Number(document.getElementById("precioProducto").value);
    const stock = Number(document.getElementById("stockProducto").value);

    if (
        nombre === "" ||
        !Number.isInteger(precio) ||
        precio <= 0 ||
        !Number.isInteger(stock) ||
        stock < 0
    ) {
        alert("Verifica el nombre, el precio y las existencias.");
        return;
    }

    productos.push({ nombre, precio, stock });

    guardarDatos()

    mostrarProductos();
    formProducto.reset();

    alert("¡Producto registrado correctamente!");
});

// Registrar una venta
formVenta.addEventListener("submit", function(evento) {
    evento.preventDefault();

    if (productos.length === 0) {
        alert("Primero debes registrar un producto.");
        return;
    }

    const indice = Number(productoVenta.value);
    const cantidad = Number(document.getElementById("cantidadVenta").value);

    if (
        productoVenta.value === "" ||
        !Number.isInteger(cantidad) ||
        cantidad <= 0
    ) {
        alert("Selecciona un producto e ingresa una cantidad válida.");
        return;
    }

    const producto = productos[indice];

    if (!producto) {
        alert("El producto seleccionado no existe.");
        return;
    }

    if (cantidad > producto.stock) {
        alert(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles.`);
        return;
    }

    const total = producto.precio * cantidad;

    // Descontar las unidades vendidas
    producto.stock -= cantidad;

    // Guardar la venta en el historial
    ventas.push({
        nombre: producto.nombre,
        cantidad: cantidad,
        total: total,
        fecha: new Date().toLocaleString("es-CO")
    });
guardarDatos()
    mostrarProductos();
    mostrarVentas();
    formVenta.reset();

    alert(`¡Venta registrada! Total: ${formatearPrecio(total)}`);
});

// Mostrar el historial de ventas y actualizar el resumen
function mostrarVentas() {
    tablaVentas.innerHTML = "";

    if (ventas.length === 0) {
        tablaVentas.innerHTML = `
            <tr>
                <td colspan="3">Todavía no hay ventas.</td>
            </tr>
        `;
    } else {
        ventas.forEach((venta) => {
            const fila = document.createElement("tr");

           
fila.innerHTML = `
    <td></td>
    <td>${venta.cantidad}</td>
    <td>${formatearPrecio(venta.total)}</td>
    <td>${venta.fecha || "Fecha no disponible"}</td>
`;

fila.cells[0].textContent = venta.nombre;


            tablaVentas.appendChild(fila);
        });
    }

    const sumaVentas = ventas.reduce(
        (acumulado, venta) => acumulado + venta.total,
        0
    );

    totalVendido.textContent = formatearPrecio(sumaVentas);
    cantidadVentas.textContent = ventas.length;
}

// Cargar la pantalla inicial
mostrarProductos();
mostrarVentas();



function editarProducto(indice) {
    const producto = productos[indice];

    if (!producto) {
        alert("No se encontró el producto.");
        return;
    }

    const nuevoNombre = prompt("Nombre del producto:", producto.nombre);

    if (nuevoNombre === null) return;

    if (nuevoNombre.trim() === "") {
        alert("El nombre no puede quedar vacío.");
        return;
    }

    const nuevoPrecioTexto = prompt(
        "Precio del producto en COP:",
        producto.precio
    );

    if (nuevoPrecioTexto === null) return;

    const nuevoPrecio = Number(nuevoPrecioTexto);

    if (!Number.isSafeInteger(nuevoPrecio) || nuevoPrecio <= 0) {
        alert("Ingresa un precio entero mayor que cero.");
        return;
    }

    const nuevoStockTexto = prompt(
        "Existencias actuales:",
        producto.stock
    );

    if (nuevoStockTexto === null) return;

    const nuevoStock = Number(nuevoStockTexto);

    if (!Number.isSafeInteger(nuevoStock) || nuevoStock < 0) {
        alert("Ingresa una cantidad entera igual o mayor que cero.");
        return;
    }

    producto.nombre = nuevoNombre.trim();
    producto.precio = nuevoPrecio;
    producto.stock = nuevoStock;

    guardarDatos();
    mostrarProductos();

    alert("Producto actualizado correctamente.");
}

function eliminarProducto(indice) {
    const producto = productos[indice];

    if (!producto) {
        alert("No se encontró el producto.");
        return;
    }

    const confirmar = confirm(
        `¿Seguro que deseas eliminar "${producto.nombre}"?`
    );

    if (!confirmar) return;

    productos.splice(indice, 1);

    guardarDatos();
    mostrarProductos();

    alert("Producto eliminado correctamente.");
}


const btnExportar = document.getElementById("btnExportar");

btnExportar.addEventListener("click", function() {
    if (ventas.length === 0) {
        alert("No hay ventas para exportar.");
        return;
    }

    const encabezados = [
        "Producto",
        "Cantidad",
        "Total COP",
        "Fecha y hora"
    ];

    const filas = ventas.map(venta => [
        venta.nombre,
        venta.cantidad,
        venta.total,
        venta.fecha || "Fecha no disponible"
    ]);

    // Proteger los valores para generar un CSV válido
    function escaparCSV(valor) {
        let texto = String(valor);

        if (/^[=+\-@\t\r]/.test(texto)) {
            texto = "'" + texto;
        }

        return '"' + texto.replace(/"/g, '""') + '"';
    }

    const contenido = [encabezados, ...filas]
        .map(fila => fila.map(escaparCSV).join(";"))
        .join("\r\n");

    const archivo = new Blob(
        ["\uFEFF" + contenido],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "reporte_ventas.csv";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);

    alert("Reporte de ventas descargado correctamente.");
});
