var editandoId = null

function Instrumento(id, codigo, nombre, marca, precio, stock, disponible, categoria, provNombre, provCiudad) {
    this.id = id
    this.codigo = codigo
    this.nombre = nombre
    this.marca = marca
    this.precio = precio
    this.stock = stock
    this.disponible = disponible
    this.categoria = categoria
    this.proveedor = {
        nombre: provNombre,
        ciudad: provCiudad
    }
}

function siguienteId(lista) {
    if (lista.length == 0) return 1
    var ids = []
    for (var i = 0; i < lista.length; i++) {
        ids.push(lista[i].id)
    }
    return Math.max.apply(null, ids) + 1
}

// Agregar y actualizar
function agregarInstrumento() {
    var nom = document.getElementById("nombre").value
    var mar = document.getElementById("marca").value

    if (nom == "" || mar == "") {
        window.alert("Debe ingresar el nombre y la marca del instrumento.")
        return
    }

    var cod = document.getElementById("codigo").value
    var pre = parseInt(document.getElementById("precio").value) || 0
    var sto = parseInt(document.getElementById("stock").value) || 0
    var dis = document.getElementById("disponible").value == "true"
    var cat = document.getElementById("categoria").value
    var pNom = document.getElementById("proveedorNombre").value
    var pCiu = document.getElementById("proveedorCiudad").value

    if (document.getElementById("precio").value != "" && pre <= 0) {
        window.alert("El precio debe ser mayor a 0.")
        return
    }
    if (document.getElementById("stock").value != "" && sto < 0) {
        window.alert("El stock no puede ser negativo.")
        return
    }

    // Cargar la lista
    var lista = JSON.parse(localStorage.getItem("instrumentos"))
    if (!lista) {
        lista = []
    }
    
    // CREATE
    if (editandoId == null) {
        var inst = new Instrumento(siguienteId(lista), cod, nom, mar, pre, sto, dis, cat, pNom, pCiu)
        lista.push(inst)
        window.alert("Instrumento agregado correctamente")
    // UPDATE
    } else {
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id == editandoId) {
                lista[i].codigo = cod
                lista[i].nombre = nom
                lista[i].marca = mar
                lista[i].precio = pre
                lista[i].stock = sto
                lista[i].disponible = dis
                lista[i].categoria = cat
                lista[i].proveedor.nombre = pNom
                lista[i].proveedor.ciudad = pCiu
            }
        }
        window.alert("Instrumento actualizado correctamente.")
    }

    localStorage.setItem("instrumentos", JSON.stringify(lista))

    cancelarEdicion()
    cargarTabla()
}


// EDITAR 
function editarInstrumento(id) {
    var lista = JSON.parse(localStorage.getItem("instrumentos"))
    var inst = null

    for (var i = 0; i < lista.length; i++) {
        if (lista[i].id == id) {
            inst = lista[i]
        }
    }

    if (!inst) return
    document.getElementById("codigo").value = inst.codigo
    document.getElementById("nombre").value = inst.nombre
    document.getElementById("marca").value = inst.marca
    document.getElementById("precio").value = inst.precio
    document.getElementById("stock").value = inst.stock
    document.getElementById("disponible").value = inst.disponible ? "true" : "false"
    document.getElementById("categoria").value = inst.categoria
    document.getElementById("proveedorNombre").value = inst.proveedor.nombre
    document.getElementById("proveedorCiudad").value = inst.proveedor.ciudad

    editandoId = id
    document.getElementById("bt-guardar").value = "Guardar cambios"
    document.getElementById("bt-cancelar").style.display = "inline-block"
    window.scrollTo(0, 0)
}

// CANCELAR EDICIÓN
function cancelarEdicion() {
    editandoId = null
    limpiarFormulario()
    document.getElementById("bt-guardar").value = "Guardar"
    document.getElementById("bt-cancelar").style.display = "none"
}

// ELIMINAR
function eliminarInstrumento(id) {
    var confirmar = window.confirm("¿Seguro que deseas eliminar este instrumento?")
    if (!confirmar) return

    var lista = JSON.parse(localStorage.getItem("instrumentos"))
    var listaNueva = []

    for (var i = 0; i < lista.length; i++) {
        if (lista[i].id != id) {
            listaNueva.push(lista[i])
        }
    }

    localStorage.setItem("instrumentos", JSON.stringify(listaNueva))

    if (editandoId == id) {
        cancelarEdicion()
    }
    window.alert("Instrumento eliminado.")
    cargarTabla()
}


// CONSULTAR DEL DÓLAR
function consultarDolar() {
    document.getElementById("bt-dolar").disabled = true
    document.getElementById("txt-dolar").innerHTML = "Consultando..."

    fetch("https://open.er-api.com/v6/latest/USD")
        .then(function (respuesta) {
            return respuesta.json()
        })
        .then(function (datos) {
            var valor = datos.rates.CLP
            document.getElementById("txt-dolar").innerHTML = "1 USD = " + valor.toFixed(2) + " CLP"
            document.getElementById("bt-dolar").disabled = false
        })
        .catch(function () {
            document.getElementById("txt-dolar").innerHTML = "No se pudo consultar la API."
            document.getElementById("bt-dolar").disabled = false
        })
}


// CARGAR TABLA 
function cargarTabla() {
    var lista = JSON.parse(localStorage.getItem("instrumentos"))
    var tbody = document.getElementById("tabla-body")

    if (!lista || lista.length == 0) {
        tbody.innerHTML = "<tr><td colspan='8' class='text-center text-muted'>No hay instrumentos registrados.</td></tr>"
        return
    }

    var html = ""
    for (var i = 0; i < lista.length; i++) {
        var inst = lista[i]
        html += "<tr>"
        html += "<td>" + (inst.codigo || "—") + "</td>"
        html += "<td>" + inst.nombre + "</td>"
        html += "<td>" + inst.marca + "</td>"
        html += "<td>" + (inst.categoria || "—") + "</td>"
        html += "<td>$" + Number(inst.precio).toLocaleString("es-CL") + "</td>"
        html += "<td>" + inst.stock + "</td>"
        html += "<td>" + (inst.disponible ? "Sí" : "No") + "</td>"
        html += "<td>"
        html += "<input type='button' value='Editar' class='btn btn-sm btn-warning me-1' onclick='editarInstrumento(" + inst.id + ")'>"
        html += "<input type='button' value='Eliminar' class='btn btn-sm btn-danger' onclick='eliminarInstrumento(" + inst.id + ")'>"
        html += "</td>"
        html += "</tr>"
    }
    tbody.innerHTML = html
}

function limpiarFormulario() {
    document.getElementById("codigo").value = ""
    document.getElementById("nombre").value = ""
    document.getElementById("marca").value = ""
    document.getElementById("precio").value = ""
    document.getElementById("stock").value = ""
    document.getElementById("disponible").value = ""
    document.getElementById("categoria").value = ""
    document.getElementById("proveedorNombre").value = ""
    document.getElementById("proveedorCiudad").value = ""
}


// DATOS INICIALES
var inicial = JSON.parse(localStorage.getItem("instrumentos"))
if (!inicial) {
    var semilla = []
    semilla.push(new Instrumento(1, "INS001", "Guitarra Eléctrica", "Fender", 950000, 8, true, "Cuerdas", "Music Import", "Santiago"))
    localStorage.setItem("instrumentos", JSON.stringify(semilla))
}

