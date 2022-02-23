
function error(message) {
    throw new Error(message);
}

// setup canvas and webgl

var canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

if (!gl) {
    error("gl not supported")
}
gl.viewport(0, 0, canvas.width, canvas.height);

// compile and link shaders

var vsSource = document.getElementById("shader-vs").innerText;
var fsSource = document.getElementById("shader-fs").innerText;

var vs = gl.createShader(gl.VERTEX_SHADER);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
var sp = gl.createProgram();
gl.shaderSource(vs, vsSource);
gl.shaderSource(fs, fsSource);
gl.compileShader(vs);
gl.compileShader(fs);
gl.attachShader(sp, vs);
gl.attachShader(sp, fs);
gl.linkProgram(sp);
if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    error("vs: " + gl.getShaderInfoLog(vs));
}
if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    error("fs: " + gl.getShaderInfoLog(fs));
}
if (!gl.getProgramParameter(sp, gl.LINK_STATUS)) {
    error("sp: " + gl.getProgramInfoLog(sp));
}

// clear scene
gl.clearColor(0.2, 0.3, 0.5, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.useProgram(sp);

// prepare buffers

var positions = new Float32Array([
    // triangle 1    
    0.0, 0.0, -0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    // triangle 2
    0.0, 0.0, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    // triangle 3
    0.0, 0.0, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
]);
var colors = new Float32Array([
    // triangle 1    
    1.0, 0.0, 0.0,
    0.0, 0.5, 0.0,
    0.0, 0.2, 0.5,
    // triangle 2
    0.0, 1.0, 0.0,
    0.5, 0.0, 0.0,
    0.5, 0.0, 1.0,
    // triangle 3
    0.0, 0.0, 1.0,
    0.0, 1.0, 0.5,
    1.0, 1.0, 0.0
]);

// set transformation matrices

var uModelMatrix = gl.getUniformLocation(sp, "uModelMatrix");
var uViewMatrix = gl.getUniformLocation(sp, "uViewMatrix");
var uProjMatrix = gl.getUniformLocation(sp, "uProjMatrix");

var modelMatrix = mat4.create();
var modelPos = vec3.fromValues(0.5, 0.0, 0.0);
mat4.translate(modelMatrix, modelMatrix, modelPos);

var viewMatrix = mat4.create();
var eyePos = vec3.fromValues(0, 0, 2.25);
var lookAt = vec3.fromValues(0, 0.0, 0);
var upVector = vec3.fromValues(0, 1, 0);
mat4.lookAt(viewMatrix, eyePos, lookAt, upVector);

var projMatrix = mat4.create();
var fieldOfView = 50 * Math.PI / 180;
var aspectRatio = canvas.width / canvas.height;
var nearClip = 1;
var farClip = 10;
mat4.perspective(projMatrix, fieldOfView, aspectRatio, nearClip, farClip);

// feed parameters to shaders

var aPosition = gl.getAttribLocation(sp, "aPosition");
var aColor = gl.getAttribLocation(sp, "aColor");

gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
gl.uniformMatrix4fv(uProjMatrix, false, projMatrix);

var posBuffer = gl.createBuffer();
var colBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aColor);

// draw scene

function animate() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 9);
    //gl.drawArrays(gl.POINTS, 0, 9);

    mat4.rotateY(modelMatrix, modelMatrix, 0.01);
    //mat4.rotateX(modelMatrix, modelMatrix, 0.02);
    //mat4.rotateZ(modelMatrix, modelMatrix, 0.03);
    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
    //mat4.rotateY(viewMatrix, viewMatrix, 0.01);
    //gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);

    requestAnimationFrame(animate);
}

animate();
