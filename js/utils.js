function completarConCeros(numero) {
    return numero.toString().padStart(4, '0');
}

function isNumber(value) {
    return typeof value === 'number' || !isNaN(value);
}

export function agregarClase(idElemento, nuevaClase) {
    const elemento = document.getElementById(idElemento);
    if (elemento) elemento.classList.add(nuevaClase);
}

export function quitarClase(idElemento, clase) {
    var elemento = document.getElementById(idElemento);
    if (elemento) {
        elemento.classList.remove(clase);
    }
}