    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            canvas.width = 5*$(document).width()/12;
            canvas.height = 80*$(document).height()/100;
            gl.viewportWidth = 5*$(document).width()/12;
            gl.viewportHeight = 80*$(document).height()/100;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }
        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fPhong");
        var vertexShader = getShader(gl, "shader-vPhong");

        shaderProgram[0] = gl.createProgram();
        gl.attachShader(shaderProgram[0], vertexShader);
        gl.attachShader(shaderProgram[0], fragmentShader);
        gl.linkProgram(shaderProgram[0]);

        if (!gl.getProgramParameter(shaderProgram[0], gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram[0]);

        shaderProgram[0].vertexPositionAttribute = gl.getAttribLocation(shaderProgram[0], "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram[0].vertexPositionAttribute);

        shaderProgram[0].vertexNormalAttribute = gl.getAttribLocation(shaderProgram[0], "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram[0].vertexNormalAttribute);

        shaderProgram[0].textureCoordAttribute = gl.getAttribLocation(shaderProgram[0], "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram[0].textureCoordAttribute);

        shaderProgram[0].pMatrixUniform = gl.getUniformLocation(shaderProgram[0], "uPMatrix");
        shaderProgram[0].vMatrixUniform = gl.getUniformLocation(shaderProgram[0], "uVMatrix");
        shaderProgram[0].mMatrixUniform = gl.getUniformLocation(shaderProgram[0], "uMMatrix");
        shaderProgram[0].nMatrixUniform = gl.getUniformLocation(shaderProgram[0], "uNMatrix");
        shaderProgram[0].cameraPosUniform = gl.getUniformLocation(shaderProgram[0], "cameraPos");
        shaderProgram[0].objMaterial = new Object();
        shaderProgram[0].objMaterial.ka = gl.getUniformLocation(shaderProgram[0], "mat.ka");
        shaderProgram[0].objMaterial.kd = gl.getUniformLocation(shaderProgram[0], "mat.kd");
        shaderProgram[0].objMaterial.ks = gl.getUniformLocation(shaderProgram[0], "mat.ks");
        shaderProgram[0].objMaterial.shininess = gl.getUniformLocation(shaderProgram[0], "mat.shininess");

        shaderProgram[0].lightUniforms = [];
        for(var i=0; i<arrayLights.length; i++){
            shaderProgram[0].lightUniforms[i] = new Object();
            shaderProgram[0].lightUniforms[i].center = gl.getUniformLocation(shaderProgram[0], "pLights["+i+"].center");
            shaderProgram[0].lightUniforms[i].la = gl.getUniformLocation(shaderProgram[0], "pLights["+i+"].la");
            shaderProgram[0].lightUniforms[i].ld = gl.getUniformLocation(shaderProgram[0], "pLights["+i+"].ld");
            shaderProgram[0].lightUniforms[i].ls = gl.getUniformLocation(shaderProgram[0], "pLights["+i+"].ls");
        }

        shaderProgram[0].dirLightUniforms = [];
        for(var i=0; i<arrayDirLights.length; i++){
            shaderProgram[0].dirLightUniforms[i] = new Object();
            shaderProgram[0].dirLightUniforms[i].center = gl.getUniformLocation(shaderProgram[0], "dLights["+i+"].center");
            shaderProgram[0].dirLightUniforms[i].dir = gl.getUniformLocation(shaderProgram[0], "dLights["+i+"].dir");
            shaderProgram[0].dirLightUniforms[i].la = gl.getUniformLocation(shaderProgram[0], "dLights["+i+"].la");
            shaderProgram[0].dirLightUniforms[i].ld = gl.getUniformLocation(shaderProgram[0], "dLights["+i+"].ld");
            shaderProgram[0].dirLightUniforms[i].ls = gl.getUniformLocation(shaderProgram[0], "dLights["+i+"].ls");
        }

        shaderProgram[0].spotLightUniforms = [];
        for(var i=0; i<arraySpotLights.length; i++){
            shaderProgram[0].spotLightUniforms[i] = new Object();
            shaderProgram[0].spotLightUniforms[i].center = gl.getUniformLocation(shaderProgram[0], "spLights["+i+"].center");
            shaderProgram[0].spotLightUniforms[i].dir = gl.getUniformLocation(shaderProgram[0], "spLights["+i+"].dir");
            shaderProgram[0].spotLightUniforms[i].la = gl.getUniformLocation(shaderProgram[0], "spLights["+i+"].la");
            shaderProgram[0].spotLightUniforms[i].ld = gl.getUniformLocation(shaderProgram[0], "spLights["+i+"].ld");
            shaderProgram[0].spotLightUniforms[i].ls = gl.getUniformLocation(shaderProgram[0], "spLights["+i+"].ls");
            shaderProgram[0].spotLightUniforms[i].cutoff = gl.getUniformLocation(shaderProgram[0], "spLights["+i+"].cutoff");
            shaderProgram[0].spotLightUniforms[i].exponent = gl.getUniformLocation(shaderProgram[0], "spLights["+i+"].exponent");
        }

        fragmentShader = getShader(gl, "shader-fFlat");
        vertexShader = getShader(gl, "shader-vFlat");

        shaderProgram[1] = gl.createProgram();
        gl.attachShader(shaderProgram[1], vertexShader);
        gl.attachShader(shaderProgram[1], fragmentShader);
        gl.linkProgram(shaderProgram[1]);

        if (!gl.getProgramParameter(shaderProgram[1], gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram[1]);

        shaderProgram[1].vertexPositionAttribute = gl.getAttribLocation(shaderProgram[1], "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram[1].vertexPositionAttribute);

        shaderProgram[1].vertexNormalAttribute = gl.getAttribLocation(shaderProgram[1], "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram[1].vertexNormalAttribute);

        shaderProgram[1].textureCoordAttribute = gl.getAttribLocation(shaderProgram[1], "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram[1].textureCoordAttribute);

        shaderProgram[1].pMatrixUniform = gl.getUniformLocation(shaderProgram[1], "uPMatrix");
        shaderProgram[1].vMatrixUniform = gl.getUniformLocation(shaderProgram[1], "uVMatrix");
        shaderProgram[1].mMatrixUniform = gl.getUniformLocation(shaderProgram[1], "uMMatrix");
        shaderProgram[1].nMatrixUniform = gl.getUniformLocation(shaderProgram[1], "uNMatrix");
        shaderProgram[1].cameraPosUniform = gl.getUniformLocation(shaderProgram[1], "cameraPos");
        shaderProgram[1].objMaterial = new Object();
        shaderProgram[1].objMaterial.ka = gl.getUniformLocation(shaderProgram[1], "mat.ka");
        shaderProgram[1].objMaterial.kd = gl.getUniformLocation(shaderProgram[1], "mat.kd");
        shaderProgram[1].objMaterial.ks = gl.getUniformLocation(shaderProgram[1], "mat.ks");
        shaderProgram[1].objMaterial.shininess = gl.getUniformLocation(shaderProgram[1], "mat.shininess");

        shaderProgram[1].lightUniforms = [];
        for(var i=0; i<arrayLights.length; i++){
            shaderProgram[1].lightUniforms[i] = new Object();
            shaderProgram[1].lightUniforms[i].center = gl.getUniformLocation(shaderProgram[1], "pLights["+i+"].center");
            shaderProgram[1].lightUniforms[i].la = gl.getUniformLocation(shaderProgram[1], "pLights["+i+"].la");
            shaderProgram[1].lightUniforms[i].ld = gl.getUniformLocation(shaderProgram[1], "pLights["+i+"].ld");
            shaderProgram[1].lightUniforms[i].ls = gl.getUniformLocation(shaderProgram[1], "pLights["+i+"].ls");
        }

        shaderProgram[1].dirLightUniforms = [];
        for(var i=0; i<arrayDirLights.length; i++){
            shaderProgram[1].dirLightUniforms[i] = new Object();
            shaderProgram[1].dirLightUniforms[i].center = gl.getUniformLocation(shaderProgram[1], "dLights["+i+"].center");
            shaderProgram[1].dirLightUniforms[i].dir = gl.getUniformLocation(shaderProgram[1], "dLights["+i+"].dir");
            shaderProgram[1].dirLightUniforms[i].la = gl.getUniformLocation(shaderProgram[1], "dLights["+i+"].la");
            shaderProgram[1].dirLightUniforms[i].ld = gl.getUniformLocation(shaderProgram[1], "dLights["+i+"].ld");
            shaderProgram[1].dirLightUniforms[i].ls = gl.getUniformLocation(shaderProgram[1], "dLights["+i+"].ls");
        }

        shaderProgram[1].spotLightUniforms = [];
        for(var i=0; i<arraySpotLights.length; i++){
            shaderProgram[1].spotLightUniforms[i] = new Object();
            shaderProgram[1].spotLightUniforms[i].center = gl.getUniformLocation(shaderProgram[1], "spLights["+i+"].center");
            shaderProgram[1].spotLightUniforms[i].dir = gl.getUniformLocation(shaderProgram[1], "spLights["+i+"].dir");
            shaderProgram[1].spotLightUniforms[i].la = gl.getUniformLocation(shaderProgram[1], "spLights["+i+"].la");
            shaderProgram[1].spotLightUniforms[i].ld = gl.getUniformLocation(shaderProgram[1], "spLights["+i+"].ld");
            shaderProgram[1].spotLightUniforms[i].ls = gl.getUniformLocation(shaderProgram[1], "spLights["+i+"].ls");
            shaderProgram[1].spotLightUniforms[i].cutoff = gl.getUniformLocation(shaderProgram[1], "spLights["+i+"].cutoff");
            shaderProgram[1].spotLightUniforms[i].exponent = gl.getUniformLocation(shaderProgram[1], "spLights["+i+"].exponent");
        }

        fragmentShader = getShader(gl, "shader-fColorNormal");
        vertexShader = getShader(gl, "shader-vColorNormal");
        shaderProgram[2] = gl.createProgram();
        gl.attachShader(shaderProgram[2], vertexShader);
        gl.attachShader(shaderProgram[2], fragmentShader);
        gl.linkProgram(shaderProgram[2]);

        if (!gl.getProgramParameter(shaderProgram[2], gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram[2]);

        shaderProgram[2].vertexPositionAttribute = gl.getAttribLocation(shaderProgram[2], "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram[2].vertexPositionAttribute);

        shaderProgram[2].vertexNormalAttribute = gl.getAttribLocation(shaderProgram[2], "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram[2].vertexNormalAttribute);

        shaderProgram[2].textureCoordAttribute = gl.getAttribLocation(shaderProgram[2], "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram[2].textureCoordAttribute);

        shaderProgram[2].pMatrixUniform = gl.getUniformLocation(shaderProgram[2], "uPMatrix");
        shaderProgram[2].vMatrixUniform = gl.getUniformLocation(shaderProgram[2], "uVMatrix");
        shaderProgram[2].mMatrixUniform = gl.getUniformLocation(shaderProgram[2], "uMMatrix");
        shaderProgram[2].nMatrixUniform = gl.getUniformLocation(shaderProgram[2], "uNMatrix");
    }

    var pMatrix = mat4.create();
    var rPyramid = 0;
    var rCube = 0;
    var cont = 0;

    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
        camera.look();

        for (var key in DisplayArray){

            if(DisplayArray[key].rotateForever)
                DisplayArray[key].Rotate(DisplayArray[key].infAngle, DisplayArray[key].infRotation);
            DisplayArray[key].Display(shaderProgram[currentShader], camera.viewMatrix, camera.position, pMatrix, shaderProgram[currentShader].objMaterial);

        }
    }


    var lastTime = 0;
    var joggingAngle = 0;

    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

            rPyramid += (90 * elapsed) / 1000.0;
            rCube = (75 * elapsed) / 1000.0;
            var elapsed = timeNow - lastTime;
        }
        lastTime = timeNow;
    }


    function tick() {
        requestAnimFrame(tick);
        drawScene();
        camera.update();
        animate();
    }


    function webGLStart() {
        var canvas = document.getElementById("canvas");
        initGL(canvas);
        initShaders();
        camera.changeAttributes([7, 7, 7], [0, 0, 0], [0, 1, 0]);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
        document.onmousedown = handleMouseDown;
        canvas.onmousemove = handleMouseMove;

        tick();
    }

    function resetCamera(){
        camera.changeAttributes([7, 7, 7], [0, 0, 0], [0, 1, 0]);
    }

