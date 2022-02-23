var canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);
var gl = canvas.getContext("webgl");
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

gl.clearColor(0.5, 0.5, 0.75, 1.0);

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, document.getElementById("vertexShader").innerText);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert("Failed to compile vertex shader");
    console.error(gl.getShaderInfoLog(vertexShader));
}

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, document.getElementById("fragmentShader").innerText);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert("Failed to compile fragment shader");
    console.error(gl.getShaderInfoLog(fragmentShader));
}

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to link shader program");
    console.error(gl.getProgramInfoLog(shaderProgram));
}
gl.validateProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
    alert("Failed to validate shader program");
    console.error(gl.getProgramInfoLog(shaderProgram));
}

// vertices are disposed counter-clockwise
var vertexData = new Float32Array([
    // x,    y,   z,   r,   g,   b

    // front
    1.0, 1.0, 1.0, 0.0, 1.0, 0.0,
    -1.0, 1.0, 1.0, 0.0, 1.0, 0.0,
    -1.0, -1.0, 1.0, 0.0, 1.0, 0.0,
    1.0, -1.0, 1.0, 0.0, 1.0, 0.0,

    // back
    -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, -1.0, 0.0, 0.0, 1.0,
    1.0, -1.0, -1.0, 0.0, 0.0, 1.0,
    -1.0, -1.0, -1.0, 0.0, 0.0, 1.0,

    // top
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, -1.0, 1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0, 1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,

    // bottom
    1.0, -1.0, 1.0, 1.0, 1.0, 0.0,
    -1.0, -1.0, 1.0, 1.0, 1.0, 0.0,
    -1.0, -1.0, -1.0, 1.0, 1.0, 0.0,
    1.0, -1.0, -1.0, 1.0, 1.0, 0.0,

    // right
    1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
    1.0, -1.0, 1.0, 1.0, 0.0, 0.0,
    1.0, -1.0, -1.0, 1.0, 0.0, 0.0,
    1.0, 1.0, -1.0, 1.0, 0.0, 0.0,

    // left
    -1.0, 1.0, 1.0, 1.0, 0.5, 0.0,
    -1.0, 1.0, -1.0, 1.0, 0.5, 0.0,
    -1.0, -1.0, -1.0, 1.0, 0.5, 0.0,
    -1.0, -1.0, 1.0, 1.0, 0.5, 0.0,

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

var posAttrib = gl.getAttribLocation(shaderProgram, "aPosition");
var posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 6 * bpe, 0);
gl.enableVertexAttribArray(posAttrib);

var colorAttrib = gl.getAttribLocation(shaderProgram, "aColor");
var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 6 * bpe, 3 * bpe);
gl.enableVertexAttribArray(colorAttrib);

var indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertexIndex, gl.STATIC_DRAW);

gl.useProgram(shaderProgram);

var mModel = new Float32Array(16);
var mView = new Float32Array(16);
var mProj = new Float32Array(16);
mat4.identity(mModel);
mat4.lookAt(mView, [0, 0, 5], [0, 0, 0], [0, 1, 0]);
mat4.perspective(mProj, Math.PI / 2, gl.drawingBufferWidth / gl.drawingBufferHeight, 1, 1000);

var modelUniform = gl.getUniformLocation(shaderProgram, "mModel");
var viewUniform = gl.getUniformLocation(shaderProgram, "mView");
var projUniform = gl.getUniformLocation(shaderProgram, "mProj");
gl.uniformMatrix4fv(modelUniform, false, mModel);
gl.uniformMatrix4fv(viewUniform, false, mView);
gl.uniformMatrix4fv(projUniform, false, mProj);

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK); // default
gl.frontFace(gl.CCW); // default

function loop() {
    mat4.rotateX(mModel, mModel, 0.005);
    mat4.rotateY(mModel, mModel, 0.010);
    gl.uniformMatrix4fv(modelUniform, false, mModel);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, vertexIndex.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);