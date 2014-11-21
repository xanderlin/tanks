function Tank() {
    this.rPyramid = 0;
    this.rCube = 0;

    this.speed = 0;
    this.yaw = 0;

    this.yawRate = 0;

    this.xPos = 0;
    this.yPos = 0;
    this.zPos = 0;

    this.lastTime = 0;
}

Tank.prototype.update = function(e) {
    if (e["yaw"] != 0) {
        this.yawRate = e["down"] ? 0.1 * e["yaw"] : 0;
    }

    if (e["thrust"] != 0) {
        this.speed = e["down"] ? 0.003 * e["thrust"] : 0;
    }
}

Tank.prototype.initBuffers = function(render){
    this.pyramidVertexPositionBuffer = render.initBuffer(
        Tank.pyramidVertexPositions(), render.gl.ARRAY_BUFFER, 3, 12);

    this.pyramidVertexColorBuffer = render.initBuffer(
        Tank.pyramidVertexColors(), render.gl.ARRAY_BUFFER, 4, 12);

    this.cubeVertexPositionBuffer = render.initBuffer(
        Tank.cubeVertexPositions(), render.gl.ARRAY_BUFFER, 3, 24);

    this.cubeVertexColorBuffer = render.initBuffer(
        Tank.cubeVertexColors(), render.gl.ARRAY_BUFFER, 4, 24);

    this.cubeVertexIndexBuffer = render.initBuffer(
        Tank.cubeVertexIndices(), render.gl.ELEMENT_ARRAY_BUFFER, 1, 36);
}

Tank.prototype.drawScene = function(render){
    // Convenience definitions
    var gl = render.gl;
    var shaderProgram = render.shaderProgram;

    var pyramidVertexPositionBuffer = this.pyramidVertexPositionBuffer;
    var pyramidVertexColorBuffer = this.pyramidVertexColorBuffer;

    var cubeVertexPositionBuffer = this.cubeVertexPositionBuffer;
    var cubeVertexColorBuffer = this.cubeVertexColorBuffer;
    var cubeVertexIndexBuffer = this.cubeVertexIndexBuffer;

    // Seek
    mat4.translate(render.mvMatrix, [this.xPos, this.yPos, this.zPos]);
    mat4.translate(render.mvMatrix, [0.0, 0.5, 0.0]);

    // Setup
    render.mvPushMatrix();
    mat4.translate(render.mvMatrix, [0.0, 0.5, 0.0]);
    mat4.rotate(render.mvMatrix, render.degToRad(this.rPyramid), [0, 1, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Draw
    render.setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);

    render.mvPopMatrix();

    // Seek
    // mat4.translate(render.mvMatrix, [0.0, 0.0, 0.0]);

    // Setup
    render.mvPushMatrix();
    mat4.rotate(render.mvMatrix, render.degToRad(this.rCube), [0, 1, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    // Draw
    render.setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    render.mvPopMatrix();
}

Tank.prototype.animate = function(render) {
    var timeNow = new Date().getTime();

    if (this.lastTime != 0) {
        var elapsed = timeNow - this.lastTime;

        if (this.speed != 0) {
            this.xPos -= Math.sin(render.degToRad(this.yaw)) * this.speed * elapsed;
            this.zPos -= Math.cos(render.degToRad(this.yaw)) * this.speed * elapsed;
        }

        this.yaw += this.yawRate * elapsed;

        this.rPyramid += (90 * elapsed) / 1000.0;
        this.rCube = this.yaw;
    }

    this.lastTime = timeNow;
}

// TANK RENDERING DATA
Tank.pyramidVertexPositions = function() {
    var width = 1.0;
    var height = 0.25;
    var depth = 1.0;

    var vertices = [
        // Front face
         0.0,    height,    0.0,
        -width, -height,  depth,
         width, -height,  depth,

        // Right face
         0.0,    height,    0.0,
         width, -height,  depth,
         width, -height, -depth,

        // Back face
         0.0,    height,    0.0,
         width, -height, -depth,
        -width, -height, -depth,

        // Left face
         0.0,    height,    0.0,
        -width, -height, -depth,
        -width, -height,  depth
    ];

    return new Float32Array(vertices);
}

Tank.pyramidVertexColors = function() {
    var colors = [
        // Front face
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Right face
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0,

        // Back face
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Left face
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0
    ];

    return new Float32Array(colors);
}

Tank.cubeVertexPositions = function() {
    var width = 1.0;
    var height = 0.25;
    var depth = 1.5;

    var vertices = [
        // Front face
        -width, -height,  depth,
         width, -height,  depth,
         width,  height,  depth,
        -width,  height,  depth,

        // Back face
        -width, -height, -depth,
        -width,  height, -depth,
         width,  height, -depth,
         width, -height, -depth,

        // Top face
        -width,  height, -depth,
        -width,  height,  depth,
         width,  height,  depth,
         width,  height, -depth,

        // Bottom face
        -width, -height, -depth,
         width, -height, -depth,
         width, -height,  depth,
        -width, -height,  depth,

        // Right face
         width, -height, -depth,
         width,  height, -depth,
         width,  height,  depth,
         width, -height,  depth,

        // Left face
        -width, -height, -depth,
        -width, -height,  depth,
        -width,  height,  depth,
        -width,  height, -depth
    ];

    return new Float32Array(vertices);
}

Tank.cubeVertexColors = function() {
    var colors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [1.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 1.0, 0.0, 1.0], // Top face
        [1.0, 0.5, 0.5, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 0.0, 1.0, 1.0]  // Left face
    ];
    var unpackedColors = [];
    for (var i in colors) {
        var color = colors[i];
        for (var j=0; j < 4; j++) {
            unpackedColors = unpackedColors.concat(color);
        }
    }

    return new Float32Array(unpackedColors);
}

Tank.cubeVertexIndices = function() {
    var cubeVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    return new Uint16Array(cubeVertexIndices);
}
