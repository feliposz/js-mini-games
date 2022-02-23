// Create a texture for using in the cube
var texFilter = true;
var texSize = 512;
var fontSize = Math.floor(texSize / 20);
var fontFace = "sans-serif";

var texCanvas = document.createElement("canvas");
var squareSize = texSize * 0.25;
texCanvas.width = texSize;
texCanvas.height = texSize;

var ctx = texCanvas.getContext("2d");
ctx.font = fontSize + "px " + fontFace;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, texSize, texSize);

var drawFace = function (squareX, squareY, faceColor, textColor, text) {
    var xOffset = -ctx.measureText(text).width / 2,
        yOffset = +fontSize / 3;
    ctx.fillStyle = faceColor;
    ctx.fillRect(squareX * squareSize, squareY * squareSize, squareSize, squareSize);
    ctx.fillStyle = "black";
    ctx.fillText(text, 1 + squareSize * (squareX + 0.5) + xOffset, 1 + squareSize * (squareY + 0.5) + yOffset);
    ctx.fillStyle = textColor;
    ctx.fillText(text, squareSize * (squareX + 0.5) + xOffset, squareSize * (squareY + 0.5) + yOffset);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(squareSize * (squareX + 0.5), squareSize * (squareY + 0.5), squareSize * .45, 0, Math.PI * 2);
    ctx.stroke();
}
drawFace(1, 0, "white", "green", "TOP");
drawFace(1, 1, "green", "white", "FRONT");
drawFace(1, 2, "yellow", "red", "BOTTOM");
drawFace(0, 1, "orange", "blue", "LEFT");
drawFace(2, 1, "red", "yellow", "RIGHT");
drawFace(3, 1, "blue", "orange", "BACK");

// Setup WebGL context
var canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
var gl = canvas.getContext("webgl");
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
gl.clearColor(0.5, 0.5, 0.75, 1.0);

// Load shaders
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, document.getElementById("vertexShader").innerText);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert("Failed to compile vertex shader");
    throw new Error(gl.getShaderInfoLog(vertexShader));
}

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, document.getElementById("fragmentShader").innerText);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert("Failed to compile fragment shader");
    throw new Error(gl.getShaderInfoLog(fragmentShader));
}

// Link shader program
var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to link shader program");
    throw new Error(gl.getProgramInfoLog(shaderProgram));
}
gl.validateProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
    alert("Failed to validate shader program");
    throw new Error(gl.getProgramInfoLog(shaderProgram));
}

// Load data for cube

// Vertices are disposed counter-clockwise
var vertexData = new Float32Array([
    // x,    y,    z,    s,   t,

    // front
    1.0, 1.0, 1.0, 0.50, 0.75,
    -1.0, 1.0, 1.0, 0.25, 0.75,
    -1.0, -1.0, 1.0, 0.25, 0.50,
    1.0, -1.0, 1.0, 0.50, 0.50,

    // back
    -1.0, 1.0, -1.0, 1.00, 0.75,
    1.0, 1.0, -1.0, 0.75, 0.75,
    1.0, -1.0, -1.0, 0.75, 0.50,
    -1.0, -1.0, -1.0, 1.00, 0.50,

    // top
    1.0, 1.0, -1.0, 0.50, 1.00,
    -1.0, 1.0, -1.0, 0.25, 1.00,
    -1.0, 1.0, 1.0, 0.25, 0.75,
    1.0, 1.0, 1.0, 0.50, 0.75,

    // bottom
    1.0, -1.0, 1.0, 0.50, 0.50,
    -1.0, -1.0, 1.0, 0.25, 0.50,
    -1.0, -1.0, -1.0, 0.25, 0.25,
    1.0, -1.0, -1.0, 0.50, 0.25,

    // right
    1.0, 1.0, 1.0, 0.50, 0.75,
    1.0, -1.0, 1.0, 0.50, 0.50,
    1.0, -1.0, -1.0, 0.75, 0.50,
    1.0, 1.0, -1.0, 0.75, 0.75,

    // left
    -1.0, 1.0, 1.0, 0.25, 0.75,
    -1.0, 1.0, -1.0, 0.00, 0.75,
    -1.0, -1.0, -1.0, 0.00, 0.50,
    -1.0, -1.0, 1.0, 0.25, 0.50,

]);
var bpe = vertexData.BYTES_PER_ELEMENT;

// group vertices in triangles
var vertexIndex = new Uint16Array([
    // front
    0, 1, 2,
    2, 3, 0,

    // back
    4, 5, 6,
    6, 7, 4,

    // right
    8, 9, 10,
    10, 11, 8,

    // left
    12, 13, 14,
    14, 15, 12,

    // right
    16, 17, 18,
    18, 19, 16,

    // left
    20, 21, 22,
    22, 23, 20
]);

// Set data to shader parameters

var posAttrib = gl.getAttribLocation(shaderProgram, "aPosition");
var posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 5 * bpe, 0);
gl.enableVertexAttribArray(posAttrib);

var texCoordAttrib = gl.getAttribLocation(shaderProgram, "aTexCoord");
var texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
gl.vertexAttribPointer(texCoordAttrib, 2, gl.FLOAT, false, 5 * bpe, 3 * bpe);
gl.enableVertexAttribArray(texCoordAttrib);

var indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertexIndex, gl.STATIC_DRAW);

gl.useProgram(shaderProgram);

// Transformation matrices

var mModel = new Float32Array(16);
var mView = new Float32Array(16);
var mProj = new Float32Array(16);
mat4.identity(mModel);
mat4.lookAt(mView, [0, 0, 4], [0, 0, 0], [0, 1, 0]);
mat4.perspective(mProj, Math.PI / 2, gl.drawingBufferWidth / gl.drawingBufferHeight, 1, 1000);

var modelUniform = gl.getUniformLocation(shaderProgram, "mModel");
var viewUniform = gl.getUniformLocation(shaderProgram, "mView");
var projUniform = gl.getUniformLocation(shaderProgram, "mProj");
gl.uniformMatrix4fv(modelUniform, false, mModel);
gl.uniformMatrix4fv(viewUniform, false, mView);
gl.uniformMatrix4fv(projUniform, false, mProj);

// Setup texture

var pixels = new ImageData(512, 512);
var i = 0;
for (i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = Math.floor(Math.random() * 256);
    pixels.data[i + 3] = 255;
}

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

var boxTex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, boxTex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texFilter ? gl.LINEAR : gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texFilter ? gl.LINEAR : gl.NEAREST);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texCanvas);

var otherTex = gl.createTexture();
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, otherTex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texFilter ? gl.LINEAR : gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texFilter ? gl.LINEAR : gl.NEAREST);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

var uTex0Location = gl.getUniformLocation(shaderProgram, "uTexture0");
var uTex1Location = gl.getUniformLocation(shaderProgram, "uTexture1");
gl.uniform1i(uTex0Location, 0);
gl.uniform1i(uTex1Location, 1);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, boxTex);
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, otherTex);

// Face culling and depth test (ordering)

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK); // default
gl.frontFace(gl.CCW); // default
//gl.enable(gl.BLEND);
//gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR);

var uMixLocation = gl.getUniformLocation(shaderProgram, "uMix");

var mix = 0;

function loop() {
    mat4.rotateX(mModel, mModel, 0.007);
    mat4.rotateY(mModel, mModel, 0.011);
    mat4.rotateZ(mModel, mModel, 0.003);
    mix += 0.03;
    if (mix > Math.PI * 2) {
        mix -= Math.PI * 2;
    }
    gl.uniformMatrix4fv(modelUniform, false, mModel);
    gl.uniform1f(uMixLocation, (Math.sin(mix) + 1) / 2);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, vertexIndex.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

document.getElementsByTagName("div")[0].appendChild(canvas);
//document.body.appendChild(texCanvas);