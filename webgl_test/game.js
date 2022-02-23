
function error(message) {
    alert(message);
    throw new Error(message);
}

// create a canvas
var canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

// obtain drawing context
var gl = canvas.getContext("webgl") || 
         canvas.getContext("experimental-webgl");

if (!gl) {
    error("Not support for WebGL");
}

// initialize the viewport
gl.viewport(0, 0, canvas.width, canvas.height);

// create shaders
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var shaderProgram = gl.createProgram();

var vertexShaderSource = 
    "attribute vec4 aPosition;\n" +
    "attribute vec4 aColor;\n" +
    "attribute float aSize;\n" +
    "varying vec4 vColor;\n" +
    "void main(void) {\n" +
    "    gl_Position = aPosition;\n" +
    "    gl_PointSize = aSize;\n" +
    "    vColor = aColor;\n" + // aColor is passed to the fragment shader using the "varying" vColor
    "}";

var fragmentShaderSource = 
    "precision mediump float;\n" +
    "varying vec4 vColor;\n" +
    "void main(void) {\n" +
    "    gl_FragColor = vColor;\n" + 
    "}";

gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.attachShader(shaderProgram, vertexShader);
gl.linkProgram(shaderProgram);

if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    error("Failed to compile fragmentShader: " + gl.getShaderInfoLog(fragmentShader));
}
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    error("Failed to compile vertexShader: " + gl.getShaderInfoLog(vertexShader));
}
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    error("Failed to link shaderProgram: " + gl.getProgramInfoLog(shaderProgram));
}

// clear screen and select shader program to use
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.useProgram(shaderProgram);

// simple drawing point by point (naive)

var aColor = gl.getAttribLocation(shaderProgram, "aColor");
var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
var aSize = gl.getAttribLocation(shaderProgram, "aSize");
gl.vertexAttrib4f(aColor, 1.0, 0.5, 0.0, 1.0);
gl.vertexAttrib2f(aPosition, 0.0, 0.5);
gl.vertexAttrib1f(aSize, 10.0);
gl.drawArrays(gl.POINTS, 0, 1);

gl.vertexAttrib4f(aColor, 0.0, 1.0, 1.0, 1.0);
gl.vertexAttrib2f(aPosition, 0.0, 0.0);
gl.vertexAttrib1f(aSize, 15.0);
gl.drawArrays(gl.POINTS, 0, 1);

gl.vertexAttrib4f(aColor, 1.0, 0.0, 1.0, 1.0);
gl.vertexAttrib2f(aPosition, 0.5, 0.0);
gl.vertexAttrib1f(aSize, 20.0);
gl.drawArrays(gl.POINTS, 0, 1);


// drawing using separate buffers
var positionsBuffer = gl.createBuffer();
var colorBuffer = gl.createBuffer();
var positions = new Float32Array([ // simple square
    -0.75, -0.75,
    -0.75, 0.75,
    0.75, 0.75,
    0.75, -0.75
]);
var colors = new Float32Array([
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0,
    1.0, 1.0, 0.0
]);

gl.vertexAttrib1f(aSize, 10.0); // all same size for simplicity

gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aColor);

gl.drawArrays(gl.LINE_LOOP, 0, 4);
gl.drawArrays(gl.POINTS, 0, 4);


// drawing using interleaved buffer (position + size + color)

var positionSizeColorBuffer = gl.createBuffer();
var positionSizeColor = new Float32Array([ // simple square
    -0.6, -0.6, 5.0, 0.5, 0.0, 0.0,
    -0.6, 0.6, 10.0, 0.0, 0.5, 0.0,
    0.6, 0.6, 15.0, 0.0, 0.0, 0.5,
    0.6, -0.6, 20.0, 0.5, 0.5, 0.0
]);
var bpe = positionSizeColor.BYTES_PER_ELEMENT;

gl.bindBuffer(gl.ARRAY_BUFFER, positionSizeColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positionSizeColor, gl.STATIC_DRAW);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 6*bpe, 0);
gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 6*bpe, 2*bpe);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6*bpe, 3*bpe);
gl.enableVertexAttribArray(aPosition);
gl.enableVertexAttribArray(aSize);
gl.enableVertexAttribArray(aColor);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
gl.drawArrays(gl.POINTS, 0, 4);

