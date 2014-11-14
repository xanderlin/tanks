/**
    The Control class controls most of the game logic for the tank game

    Its responsibilities include:
        Setting up the game
        Maintaining and updating game state
            Dealing with user input
            Responding to and putting data on Crosscloud
        Passing relevant information on to the render pipeline
*/

function Control() {
    this.canvasId = "tanks-canvas";

    this.id = "id";
    this.tanks = {};
}

Control.prototype.handleKey = function(event, isDown) {
    //e = translateEvent(event, isDown);
    //this.tanks[this.you].update(e);
}

Control.prototype.probe = function() {
}

Control.prototype.tick = function() {
    // Bind display refresh
    var control = this;
    requestAnimFrame(function(){control.tick()});

    // Render scene
    this.render.drawScene();

    this.map.drawScene(this.render);

    this.tanks[this.id].drawScene(this.render);
    this.tanks[this.id].animate(this.render);
}

Control.prototype.start = function() {
    // Start Web GL
    this.render = new Render();
    this.render.initGL(this.canvasId);

    // Bind Controls
    document.onkeydown = function(event) {
        return Control.prototype.handleKey(event, true); };
    document.onkeyup = function(event) {
        return Control.prototype.handleKey(event, false); };

    // Initialize Object Data
    this.map = new Map();
    this.tanks[this.id] = new Tank(this.id);

    // Initialize Object Buffers 
    this.render.initShaders();

    this.map.initBuffers(this.render);
    this.tanks[this.id].initBuffers(this.render);

    this.render.initCanvas();

    // Start ticking
    this.tick();
}
