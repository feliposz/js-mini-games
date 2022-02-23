function initDemo() {
    var resources = {};
    var countDown = 4;

    loadImage("cube_sides.png", function (e, d) {
        done("cubeTexture", e, d);
    });
    loadJSONResource("cube.json", function (e, d) {
        done("cubeObj", e, d);
    });
    loadTextResource("demo018-vertex.glsl", function (e, d) {
        done("vertexShaderSource", e, d);
    });
    loadTextResource("demo018-fragment.glsl", function (e, d) {
        done("fragmentShaderSource", e, d);
    });

    var done = function (name, error, data) {
        if (error) {
            console.error(error);
            resources[name] = null;
        } else {
            console.log("Loaded " + name);
            resources[name] = data;
        }
        countDown--;
        if (countDown === 0) {
            runDemo(resources.cubeObj, resources.cubeTexture, resources.vertexShaderSource, resources.fragmentShaderSource);
        }
    }
}

function runDemo(cubeObj, cubeTexture, vertexShaderSource, fragmentShaderSource) {

    var vertexData = new Float32Array(cubeObj.vertices);
    var vertexIndex = new Uint16Array(cubeObj.indices);

    // Setup WebGL

    var gl = initGL();
    var vertexShader = initShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = initShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var shaderProgram = initProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(shaderProgram);

    var posBuffer = initVertexBuffer(gl, gl.getAttribLocation(shaderProgram, "aPosition"), vertexData, 3, 5, 0);
    var texCoordBuffer = initVertexBuffer(gl, gl.getAttribLocation(shaderProgram, "aTexCoord"), vertexData, 2, 5, 3);
    var indexBuffer = initIndexBuffer(gl, vertexIndex);

    var boxTex = initTexture(gl, 0, gl.getUniformLocation(shaderProgram, "uTexture0"), true, gl.CLAMP_TO_EDGE, gl.LINEAR, cubeTexture);

    // Transformation matrices

    var mModel = mat4.create();
    var mView = mat4.create();
    var mProj = mat4.create();
    mat4.identity(mModel);
    mat4.lookAt(mView, [0, 0, 4], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(mProj, Math.PI / 2, gl.drawingBufferWidth / gl.drawingBufferHeight, 1, 1000);

    var modelUniform = gl.getUniformLocation(shaderProgram, "mModel");
    var viewUniform = gl.getUniformLocation(shaderProgram, "mView");
    var projUniform = gl.getUniformLocation(shaderProgram, "mProj");
    gl.uniformMatrix4fv(modelUniform, false, mModel);
    gl.uniformMatrix4fv(viewUniform, false, mView);
    gl.uniformMatrix4fv(projUniform, false, mProj);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    function loop() {
        mat4.rotateX(mModel, mModel, 0.007);
        mat4.rotateY(mModel, mModel, 0.011);
        mat4.rotateZ(mModel, mModel, 0.003);
        gl.uniformMatrix4fv(modelUniform, false, mModel);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, vertexIndex.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

}

initDemo();