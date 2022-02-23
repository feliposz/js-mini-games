function initDemo() {
    var resources = {};
    var countDown = 4;

    loadImage("SusanTexture.png", function (e, d) {
        done("objTexture", e, d);
    });
    loadJSONResource("Susan.json", function (e, d) {
        done("objModel", e, d);
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
            runDemo(resources.objModel, resources.objTexture, resources.vertexShaderSource, resources.fragmentShaderSource);
        }
    }
}

function runDemo(objModel, objTexture, vertexShaderSource, fragmentShaderSource) {

    var vertices = new Float32Array(objModel.meshes[0].vertices);
    var coords = new Float32Array(objModel.meshes[0].texturecoords[0]);
    var indices = new Uint16Array([].concat.apply([], objModel.meshes[0].faces));

    // Setup WebGL

    var gl = initGL();
    var vertexShader = initShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = initShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var shaderProgram = initProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(shaderProgram);

    var posBuffer = initVertexBuffer(gl, gl.getAttribLocation(shaderProgram, "aPosition"), vertices, 3, 3, 0);
    var texCoordBuffer = initVertexBuffer(gl, gl.getAttribLocation(shaderProgram, "aTexCoord"), coords, 2, 2, 0);
    var indexBuffer = initIndexBuffer(gl, indices);

    var boxTex = initTexture(gl, 0, gl.getUniformLocation(shaderProgram, "uTexture0"), true, gl.CLAMP_TO_EDGE, gl.LINEAR, objTexture);

    // Transformation matrices

    var mModel = mat4.create();
    var mView = mat4.create();
    var mProj = mat4.create();
    mat4.identity(mModel);
    mat4.lookAt(mView, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(mProj, Math.PI / 2, gl.drawingBufferWidth / gl.drawingBufferHeight, 1, 1000);

    var modelUniform = gl.getUniformLocation(shaderProgram, "mModel");
    var viewUniform = gl.getUniformLocation(shaderProgram, "mView");
    var projUniform = gl.getUniformLocation(shaderProgram, "mProj");
    gl.uniformMatrix4fv(modelUniform, false, mModel);
    gl.uniformMatrix4fv(viewUniform, false, mView);
    gl.uniformMatrix4fv(projUniform, false, mProj);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    function loop() {
        var t = performance.now();
        mat4.identity(mModel);
        mat4.rotateX(mModel, mModel, Math.PI * Math.sin(t * 0.00034213));
        mat4.rotateY(mModel, mModel, Math.PI * Math.sin(t * 0.00011354));
        //mat4.rotateZ(mModel, mModel, Math.PI * Math.sin(t * 0.0005));
        gl.uniformMatrix4fv(modelUniform, false, mModel);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

}

initDemo();