// PASO 1: referencias al DOM
const btnAgregar = document.querySelector(".navBar__add");
const btnCerrar = document.querySelector(".overlay button");
const overlay = document.querySelector(".overlay");
const form = document.querySelector(".form");
const inputFoto = document.getElementById("product-image");
const spanNombreArchivo = document.getElementById("nombre-archivo");
const inputNombre = document.getElementById("product-name");
const inputPrecio = document.getElementById("product-price");
const inputCantidad = document.getElementById("product-stock");
const contenedorArticulos = document.querySelector(".main");

// PASO 4: el array del inventario
let inventario = [];

// PASO 3: mostrar y ocultar el modal
btnAgregar.addEventListener("click", function() {
    overlay.classList.remove("oculto");
});

btnCerrar.addEventListener("click", function() {
    overlay.classList.add("oculto");
});

// PASO 5: mostrar el nombre del archivo elegido
inputFoto.addEventListener("change", function() {
    const archivo = inputFoto.files[0];
    spanNombreArchivo.textContent = archivo.name;
});
function guardarInventario(){
    localStorage.setItem("inventario", JSON.stringify(inventario));
}
function cargarInventario(){
    const datosGuardados = localStorage.getItem("inventario");
    if (datosGuardados) {
        inventario = JSON.parse(datosGuardados);
    }
}
function reducirFoto(urlOriginal, callback){
    const imagen = new Image();
    imagen.onload = function(){
        const anchoMaximo = 400;
        const escala = anchoMaximo / imagen.width;
        const canvas = document.createElement("canvas");
        canvas.width = anchoMaximo;
        canvas.height = imagen.height * escala;
        const contexto = canvas.getContext("2d");
        contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL("image/jpeg", 0.7));
    };
    imagen.src = urlOriginal;
}
// PASO 9: función que dibuja todas las tarjetas
function renderizarInventario() {
    contenedorArticulos.innerHTML = "";

    inventario.forEach(function(articulo, indice){
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("card");

        tarjeta.innerHTML = `
            <img src="${articulo.foto}" class="card__thumbnail">
            <h3 class="card__name" title="${articulo.nombre}">${articulo.nombre}</h3>
            <ul class="card__list">
                <li class="card__item">$${articulo.precio}</li>
                <li class="card__item">${articulo.cantidad}</li>
            </ul>
            <div class="card__buttons-container">
                <button class="card__button card__sumar" data-indice="${indice}">+</button>
                <button class="card__button card__restar" data-indice="${indice}">-</button>
                <button class="card__button card__restar-personalizado" data-indice="${indice}">-n</button>
                <button class="card__button card__delete" data-indice="${indice}">del.</button>
                <button class="card__button card__price" data-indice="${indice}">$</button>
            </div>
        `;
        contenedorArticulos.appendChild(tarjeta);
    });
}

form.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const archivo = inputFoto.files[0];
    const lector = new FileReader();

    lector.onload = function(){
        reducirFoto(lector.result, function(fotoReducida){
            const nuevoArticulo = {
                foto: fotoReducida,
                nombre: inputNombre.value,
                precio: inputPrecio.value,
                cantidad: inputCantidad.value
            };
            inventario.push(nuevoArticulo);
                guardarInventario();
            renderizarInventario();

            form.reset();
            overlay.classList.add("oculto");
            
        });
    };
    lector.readAsDataURL(archivo);
});
cargarInventario();
renderizarInventario();
contenedorArticulos.addEventListener("click", function(evento){
    if (evento.target.classList.contains("card__delete")){
        const indice = evento.target.dataset.indice;
        inventario.splice(indice, 1);
        guardarInventario();
        renderizarInventario();
    }
    if (evento.target.classList.contains("card__sumar")){
        const indice = evento.target.dataset.indice;
        inventario[indice].cantidad = Number(inventario[indice].cantidad)+1;
        guardarInventario();
        renderizarInventario();
    }
    if (evento.target.classList.contains("card__restar")){
        const indice = evento.target.dataset.indice;
        const cantidadActual=Number(inventario[indice].cantidad);
        if(cantidadActual>0){
            inventario[indice].cantidad = cantidadActual-1;
            guardarInventario();
            renderizarInventario();
        }
    }
    if(evento.target.classList.contains("card__restar-personalizado")){
        const indice = evento.target.dataset.indice;
        const cantidadActual=Number(inventario[indice].cantidad);
        const respuesta = prompt("Cuanto deseas restar? / Si desea sumar un numero, agrégale un guion (menos) antes del numero")
        if(cantidadActual<respuesta){
            alert("no se pudo realizar la operacion")
        }
        if (cantidadActual>0 && cantidadActual>=respuesta){
            inventario[indice].cantidad = cantidadActual-respuesta;
            guardarInventario();
            renderizarInventario();
        }
    }
    if(evento.target.classList.contains("card__price")){
        const indice = evento.target.dataset.indice;
        const actualPrice=Number(inventario[indice].precio);
        const respuesta = prompt("Escribe el precio actualizado")
        inventario[indice].precio = respuesta;
        guardarInventario();
        renderizarInventario();
    }
});