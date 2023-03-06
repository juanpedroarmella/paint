var canvas = document.getElementById("paint");
let ctx = canvas.getContext("2d");
let pencil = new Pencil(1, 'circle');
let width = canvas.width;
let height = canvas.height;
let mouseDown = false;
let a = 255;
let imageDataRestore = ctx.getImageData(0, 0, width, height);
let imageRestore = backupImage(imageDataRestore);


//pinta de blanco el canvas por primera vez
fillWhite();




document.getElementById("pencil").addEventListener("click", () => {
    pencil.setForm('circle');
})
document.getElementById("rubber").addEventListener("click", () => {
    pencil.setForm('rubber');
})


document.getElementById("paint").addEventListener("mousedown", () => {
    mouseDown = true;
    ctx.beginPath();
})

document.getElementById("paint").addEventListener("mousemove", (e) => {
    if (mouseDown) {
        draw(e)
    }

})

document.getElementById("paint").addEventListener("mouseup", () => {
    mouseDown = false;
})

window.addEventListener("mouseup", () => {
    mouseDown = false;
})


//esta funcion se utiliza para dibujar en el canvas utilizando las herramientas de ctx y la clase pencil
//clientX,clientY: proporciona la coordenada horizontal y vertical dentro de la ventana grafica donde ocurrio el evento
function draw(e) {
    let color = document.getElementById("color").value;
    let grosor = document.getElementById("grosor").value;
    pencil.setGrosor(grosor);
    ctx.lineWidth = pencil.getGrosor();
    if (pencil.getForm() == 'circle') {
        ctx.lineCap = 'round';
    } else {
        color = "#ffffff"
        ctx.lineCap = 'square';
    }

    pencil.setColor(color);
    ctx.strokeStyle = pencil.getColor();
    let c = canvas.getBoundingClientRect();    //devuelve el tamaño de un elemento y su posicion relativa respecto a la ventana
    ctx.lineTo(e.clientX - c.left, e.clientY - c.top); //se utilizo para obtener la posicion exacta del mouse
    ctx.stroke();

}

//Empieza codigo modal inicio
let pop_up = document.getElementById("pop-up");
let closePop = document.getElementById("close-pop-up");

closePop.addEventListener("click", close_popUp);



//Le agrego un listener al evento en toda la ventana

window.addEventListener('click', function (e) {
    //si el div no contiene el target lo oculta
    if (!(pop_up.contains(e.target))) {
        pop_up.classList.add("hidden");

    }
})

function close_popUp() {
    pop_up.classList.add("hidden");
    fillWhite();
}

function fillWhite() {
    ctx.fillStyle = "#FFFFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


//Codigo para borrar imagen de canvas
let btn_borrar = document.getElementById("borrar_imagen");

btn_borrar.addEventListener('click', borrar_canvas);

function borrar_canvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;
    fillWhite();
}

let file = document.getElementById('archivo');
let fileModal = document.getElementById('archivoModal');

file.addEventListener('change', subirImagen);
fileModal.addEventListener('change', subirImagen);



function subirImagen(event) {
    close_popUp();
    borrar_canvas();
    let reader = new FileReader(); //permite que las aplicaciones lean ficheros almacenados de manera asincronica
    let fileReader = event.target.files[0];
    reader.readAsDataURL(fileReader); //comienza la lectura y una vez terminada el atributo result contiene un url que representa los datos del fichero
    reader.onloadend = (event) => {
        let contenido = event.target.result;
        let image = new Image();
        image.src = contenido;
        image.onload = () => {
            //Sacando el if y el else todas las imagenes se adaptarian al tamaño del canvas
            if ((canvas.width < image.width) || (canvas.height < image.height)) {
                //cuenta matematica que utilizamos para adaptar la imagen al canvas
                var hRatio = canvas.width / image.width;
                var vRatio = canvas.height / image.height;
                var ratio = Math.min(hRatio, vRatio);
                canvas.width = image.width * ratio;
                canvas.height = image.height * ratio;
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width * ratio, image.height * ratio);
            } else {
                ctx.clearRect(0, 0, width, height);
                canvas.width = image.width
                canvas.height = image.height
                ctx.drawImage(image, 0, 0);
            }
            //realizamos un backup de la imagen inicial
            imageDataRestore = ctx.getImageData(0, 0, width, height);
            imageRestore = backupImage(imageDataRestore)
        }
    }
    file.value = "";
}

//guardar imagen

let btn_guardarImagen = document.getElementById("guardar_imagen");

btn_guardarImagen.addEventListener('click', () => {
    let boton = document.createElement('a');
    boton.download = "Paint.png";
    boton.href = document.getElementById('paint').toDataURL("image/png").replace("image/png", "image/octet-stream");
    boton.click();
})

//pop-up filtro

document.getElementById("select-filters").addEventListener("click", showOrHideFilters)
function showOrHideFilters() {
    let divFilters = document.getElementById("filters")
    divFilters.classList.toggle("hidden");
}


//filtros


//negativo 

document.getElementById("negative").addEventListener("click", negativeFilter);

function negativeFilter() {
    let a = 255;
    let imageData = ctx.getImageData(0, 0, width, height);
    applyNegative(imageData, a);
    ctx.putImageData(imageData, 0, 0) * 4;
}

//funcion para aplicar el filtro negativo
//se determina el valor inverso de un color restando del valor máximo el valor del color original => (255 - r/g/b)
function applyNegative(imageData, a) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let index = (x + y * imageData.width) * 4;
            let r = imageData.data[index + 0];
            let g = imageData.data[index + 1];
            let b = imageData.data[index + 2];
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
            setPixel(imageData, x, y, r, g, b);
        }
    }
}

//brillo

document.getElementById("menosBrillo").addEventListener("click", brightnessFilter);
document.getElementById("masBrillo").addEventListener("click", brightnessFilter);

function brightnessFilter(e) {
    let a = 255;
    let imageData = ctx.getImageData(0, 0, width, height);
    applyBrightnessFilter(imageData, a, e);
    ctx.putImageData(imageData, 0, 0) * 4;
}
//funcion para aplicar brillo
//dependiendo si el boton que se aprieta es + 0 - se suma o resta 5 puntos al rgb
function applyBrightnessFilter(imageData, a, e) {
    if (e.target.id === "masBrillo") {
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                setPixelMore(imageData, x, y, a);
            }
        }
    } else {
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                setPixelLess(imageData, x, y, a);
            }
        }
    }

}
function setPixelLess(imageData, x, y, a) {
    let index = (x + y * imageData.width) * 4;
    imageData.data[index + 0] = imageData.data[index + 0] - 5;
    imageData.data[index + 1] = imageData.data[index + 1] - 5;
    imageData.data[index + 2] = imageData.data[index + 2] - 5;
    imageData.data[index + 3] = a;
}
function setPixelMore(imageData, x, y, a) {
    let index = (x + y * imageData.width) * 4;
    imageData.data[index + 0] = imageData.data[index + 0] + 5;
    imageData.data[index + 1] = imageData.data[index + 1] + 5;
    imageData.data[index + 2] = imageData.data[index + 2] + 5;
    imageData.data[index + 3] = a;
}

//greyscale

document.getElementById("greyScale").addEventListener("click", greyScaleFilter);

function greyScaleFilter() {
    let a = 255;
    let imageData = ctx.getImageData(0, 0, width, height);
    applyGreyScale(imageData);
    ctx.putImageData(imageData, 0, 0) * 4;
}

//funcion para aplicar escala de grises
//para averiguar el gris de un pixel se suman los valores rgb y se los divide por 3
function applyGreyScale(imageData) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let index = (x + y * imageData.width) * 4;
            var grey = (imageData.data[index + 0] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
            let r = grey;
            let g = grey;
            let b = grey;
            setPixel(imageData, x, y, r, g, b);

        }
    }
}

//binarizacion

document.getElementById("binarizacion").addEventListener("click", binarizacionFilter);

function binarizacionFilter() {

    let imageData = ctx.getImageData(0, 0, width, height);
    applyBinarizacion(imageData, a);
    ctx.putImageData(imageData, 0, 0) * 4;
}

//primero se aplica el gris al pixel=>si el pixel resultante es menor a la mitad de 255 se transforma en negro,sino se transforma en blanco
function applyBinarizacion(imageData) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let index = (x + y * imageData.width) * 4;
            var binarizacion = (imageData.data[index + 0] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
            (binarizacion > (255 / 2)) ? binarizacion = 255 : binarizacion = 0;
            let r = binarizacion;
            let g = binarizacion;
            let b = binarizacion;
            setPixel(imageData, x, y, r, g, b);
        }
    }
}

//Sepia

document.getElementById("sepia").addEventListener("click", sepiaFilter);

function sepiaFilter() {
    let imageData = ctx.getImageData(0, 0, width, height);
    applySepia(imageData);
    ctx.putImageData(imageData, 0, 0) * 4;
}


//primero se le aplica a cada r,g y b el negativo
//luego se realiza el siguiente calculo matematico
//r se vuelve (r * .393) + (g * .769) + (b * .189)
//g se vuelve (r * .349) + (g * .686) + (b * .168)
//b se vuelve (r * .272) + (g * .534) + (b * .131)
//fuente: https://www.etnassoft.com/2016/11/03/manipulacion-de-imagenes-con-javascript-parte-1/
function applySepia(imageData) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let index = (x + y * imageData.width) * 4;

            let r = imageData.data[index + 0];
            let g = imageData.data[index + 1];
            let b = imageData.data[index + 2];

            imageData.data[index + 0] = 255 - r;
            imageData.data[index + 1] = 255 - g;
            imageData.data[index + 2] = 255 - b;

            imageData.data[index + 0] = (r * .393) + (g * .769) + (b * .189);
            imageData.data[index + 1] = (r * .349) + (g * .686) + (b * .168);
            imageData.data[index + 2] = (r * .272) + (g * .534) + (b * .131);

            r = imageData.data[index + 0];
            g = imageData.data[index + 1];
            b = imageData.data[index + 2];


            setPixel(imageData, x, y, r, g, b);
        }
    }
}
//Saturacion

document.getElementById("saturacion").addEventListener("change", saturacionFilter);

function saturacionFilter() {
    let sat = document.getElementById("saturacion").value;
    sat = sat / 100
    let a = 255;
    let imageData = ctx.getImageData(0, 0, width, height);
    applySaturacion(imageData, a, sat);
    ctx.putImageData(imageData, 0, 0) * 4;
}


//para aplicar una determinada saturacion se tiene que pasar
//el rgb a notacion hsl, subir o bajar la cantidad de contraste deseada en s
//y luego volver a transformar a rgb
function applySaturacion(imageData, a, sat) {
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            //obtengo rgb
            let arr = [];
            arr = getRgb(imageData, x, y);
            let r = arr[0];
            let g = arr[1];
            let b = arr[2];

            //paso de rgb a hsl
            let arrHsl = []
            arrHsl = rgbToHsl(r, g, b);
            let h = arrHsl[0];
            let s = arrHsl[1];
            let l = arrHsl[2];
            //modifico s
            s = sat;
            //paso de hsl a rgb
            arr = hslToRgb(h, s, l);
            r = arr[0];
            g = arr[1];
            b = arr[2];
            //reemplazo el pixel
            setPixel(imageData, x, y, r, g, b, a);
        }
    }
}


//cuenta matematica sacada de internet
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return [h, s, l];
}

//cuenta matematica sacada de internet
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}


//devuelve un arreglo con el rgb de un pixel
function getRgb(imageData, x, y) {

    let index = (x + y * imageData.width) * 4;
    let arr = [];
    arr[0] = imageData.data[index + 0];
    arr[1] = imageData.data[index + 1];
    arr[2] = imageData.data[index + 2];
    return arr;
}


//reemplaza el rgb un pixel de una imagen
function setPixel(imageData, x, y, r, g, b) {
    let index = (x + y * imageData.width) * 4;
    imageData.data[index + 0] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}


//blur

document.getElementById("blur").addEventListener("click", blurFilter);

function blurFilter() {
    let mat = [[1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9]]
    let a = 255;
    let imageData = ctx.getImageData(0, 0, width, height);
    applyBlur(imageData, mat, a);
    ctx.putImageData(imageData, 0, 0) * 4;
}
//Esta funcion, aplica el filtro blur, el cual en cada iteracion obtiene un promedio de los pixeles vecinos al que estoy situado

function applyBlur(imageData, mat, a) {
    let data = imageData.data;
    for (let x = 1; x < canvas.width - 1; x++) {
        for (let y = 1; y < canvas.height - 1; y++) {
            let rgb = averageMatrix(data, mat, x, y);
            setPixel(imageData, x, y, rgb[0], rgb[1], rgb[2], a);
        }
    }
}
//La funcion averageMatrix, devuelve un arreglo con los valores en r,g,b
//Los valores contienen, el resultado de recorrer la matriz dada, y la matriz definidas por las posiciones dadas de la imagen (x ,y )

function averageMatrix(imageData, mat, x, y) {
    let r = 0;
    let g = 0;
    let b = 0;
    let matX = 0;
    let matY = 0;
    for (let imgX = x - 1; imgX <= x + 1; imgX++) {
        for (let imgY = y - 1; imgY <= y + 1; imgY++) {
            r += getValor(imageData, imgX, imgY, 0) * devolverValorEnMatriz(mat, matX, matY);
            g += getValor(imageData, imgX, imgY, 1) * devolverValorEnMatriz(mat, matX, matY);
            b += getValor(imageData, imgX, imgY, 2) * devolverValorEnMatriz(mat, matX, matY);
            matY++;
        }
        matY = 0;
        matX++;
    }
    return [r, g, b]
}
//La funcion getValor, devuelve el valor en forma de arreglo, en una posicion dada de la imagen.
// Definiendo que si el indice es null, se vuelve 0
function getValor(data, x, y, indice) {
    if (indice === null)
        indice = 0;
    return data[((width * y) + x) * 4 + indice];
}
//deteccion de bordes

document.getElementById("deteccionBordes").addEventListener("click", deteccionDeBordesFilter);
//funcion inicial que define las matrices del operador de sobel para realizar el filtro 
//de deteccion de bordes
function deteccionDeBordesFilter() {
    let matX = [[-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]];

    let matY = [[-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]];
    let imageData = ctx.getImageData(0, 0, width, height);
    let returnData = applyDeBordesFilter(imageData, matX, matY);
    ctx.putImageData(returnData, 0, 0);
}

//COn esta funcion retorno en forma de arreglo los valores en tonalidad gris de la imagen.
function valoresGrisEnArrayDeImagen(data) {
    let retorno = [];
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            let rgb = getRgb(data, x, y);
            let avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
            retorno.push(avg, avg, avg, 255);
        }
    }
    return retorno;
}
//Funcion que aplica el filtro de deteccion de bordes
//Se le pasa la imagen cargada, y los dos kernels de 3x3 del operador de sobel para realizar el filtro
//Definimos un array grey_scale para obtener los valores en tonalidad gris de la imagen sin setearselos.
//Con el metodo valoresGrisEnArrayDeImagen, obtenemos dichos valores para trabajar sobre ellos.
//Dentro de la iteracion, se realiza la multiplicacion de los kernels por una matriz 3x3 de la imagen en la posicion obtenida por la iteracion
//Luego de obtener el promedio, se realiza la combinacion de resultados para calcular la magnitud del gradiente.\
//Pasando asi, a obtener un gradiente mas optimo y luego devolver los valores de la imag
function applyDeBordesFilter(imageData, matX, matY) {
    let filtro = imageData;
    let grey_scale = [];
    let data = imageData;
    grey_scale = valoresGrisEnArrayDeImagen(data);
    data = grey_scale;
    for (y = 0; y < canvas.height; y++) {
        for (x = 0; x < canvas.width; x++) {
            let pixelX = averageMatrix(data, matX, x, y);
            pixelX = pixelX[0] = pixelX[1] + pixelX[2];
            let pixelY = averageMatrix(data, matY, x, y);
            pixelY = pixelY[0] = pixelY[1] + pixelY[2];
            let magnitud = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY));
            magnitud = (magnitud / 1000) * 255;
            setPixel(filtro, x, y, magnitud, magnitud, magnitud);
        }
    }
    return filtro;
}
//Devuelve un valor numerico de la matriz en la posicion x e y pasadas por parametros.
function devolverValorEnMatriz(mat, x, y) {
    return mat[x][y];
}

document.getElementById("restoreImage").addEventListener("click", restoreImage);
///Funcion que vuelve al estado original la imagen
function restoreImage() {
    ctx.putImageData(imageDataRestore, 0, 0) * 4;

}
//La funcion backupImage, recibe la imagen cargada, y crea un punto de restauracion de dicha imagen

function backupImage(pictureData) {
    let backupPicture = new ImageData(pictureData.width, pictureData.height);
    for (let x = 0; x < pictureData.width; x++) {
        for (let y = 0; y < pictureData.height; y++) {
            let index = (x + y * pictureData.width) * 4
            let r = pictureData.data[index + 0];
            let g = pictureData.data[index + 1];
            let b = pictureData.data[index + 2];
            setPixel(backupPicture, x, y, r, g, b, 255);
        }
    }
    return backupPicture;
}