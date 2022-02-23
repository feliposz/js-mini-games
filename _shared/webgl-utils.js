
function initGL() {
    // Setup WebGL context
    var canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    var gl = canvas.getContext("webgl");
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.5, 0.5, 0.75, 1.0);
    document.body.appendChild(canvas);
    return gl;
}


function initShader(gl, shaderType, shaderSource) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Failed to compile vertex shader");
        gl.deleteShader(shader);
        throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function initProgram(gl, vertexShader, fragmentShader) {
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Failed to link shader program");
        gl.deleteShader(shaderProgram);
        throw new Error(gl.getProgramInfoLog(shaderProgram));
    }
    gl.validateProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
        alert("Failed to validate shader program");
        gl.deleteShader(shaderProgram);
        throw new Error(gl.getProgramInfoLog(shaderProgram));
    }
    return shaderProgram;
}

function initVertexBuffer(gl, attrib, data, size, stride, offset) {
    var bpe = data.BYTES_PER_ELEMENT;    
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attrib, size, gl.FLOAT, false, stride * bpe, offset * bpe);
    gl.enableVertexAttribArray(attrib);
    return buffer;
}

function initIndexBuffer(gl, indexData) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
    return buffer;
}

function initTexture(gl, texNumber, uniform, flipY, wrapMode, filterMode, source) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + texNumber);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMode);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.uniform1i(uniform, texNumber);
    
    return texture;
}

function loadTextResource(url, callback) {
    var request = new XMLHttpRequest();
    request.onload = function () {
        if (request.status >= 200 && request.status <= 299) {
            callback(null, request.response);
        } else {
            callback("Error loading text resource. Status code: " + request.status + " URL: " + url);
        }
    };
    request.onerror = function (e) {
        callback("Error loading text resource. URL: " + url);
    }
    request.open("GET", url, true);
    request.send();
}

function loadJSONResource(url, callback) {
    loadTextResource(url, function (error, data) {
        if (error) {
            callback(error);
        } else {
            var json = null;
            try {
                json = JSON.parse(data);                
            } catch (e) {
                callback("Error parsing JSON resource. URL: " + url);
                return;
            }
            callback(null, json);
        }
    });
}

function loadImage(url, callback) {
    var image = new Image();
    image.onload = function () {
        callback(null, image);
    }
    image.onerror = function () {
        callback("Error loading image. URL: " + url);
    }
    image.src = url;
}
