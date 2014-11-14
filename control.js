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
    e = this.translateEvent(event, isDown);
    this.tanks[this.id].update(e);
}

Control.prototype.translateEvent = function(event, isDown) {
    var e = {};

    e["id"] = this.id;
    e["down"] = isDown;

    // Thruster Control
    switch(event.keyCode) {
        case 37:    // left
        case 65:    // A

            e["yaw"] = 1;
            e["thrust"] = 0;
            break;

        case 39:    // right
        case 68:    // D

            e["yaw"] = -1;
            e["thrust"] = 0;
            break;

        case 38:    // up
        case 87:    // W

            e["yaw"] = 0;
            e["thrust"] = 1;
            break;

        case 40:    // down
        case 83:    // S

            e["yaw"] = 0;
            e["thrust"] = -1;
            break;

        default:
            e["yaw"] = 0;
            e["thrust"] = 0;
    }

    return e;
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
    var control = this;
    document.onkeydown = function(event) {
        return control.handleKey(event, true); };
    document.onkeyup = function(event) {
        return control.handleKey(event, false); };

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
