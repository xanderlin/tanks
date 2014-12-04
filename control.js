/**
    The Control class controls most of the game logic for the tank game

    Its responsibilities include:
        Setting up the game
        Maintaining and updating game state
            Dealing with user input
            Responding to and putting data on Crosscloud
        Passing relevant information on to the render pipeline
*/

// Start a new tank game instance
function Control() {
    // Storage structures
    this.canvasId = "tanks-canvas";

    this.tanks = {};
    this.processed = {};
    this.keys = {};

    // Connect to the Network
    this.network = new Network();

    // Set id...?
    this.game_id = 20;
    this.id = "tank_0";
}

Control.prototype.handleKey = function(event, isDown) {
    e = this.translateKeyEvent(event, isDown);

    this.tanks["echo"].update(e);
    this.network.broadcast(e);
}

Control.prototype.translateKeyEvent = function(event, isDown) {
    var e = {};

    e["tank_id"] = this.id;
    e["game_id"] = this.game_id;

    // Thruster Control
    // Abort if no keypress change...
    switch(event.keyCode) {
        case 37:    // left
        case 65:    // A
            this.keys["left"] = isDown;
            break;

        case 39:    // right
        case 68:    // D
            this.keys["right"] = isDown;
            break;

        case 38:    // up
        case 87:    // W
            this.keys["up"] = isDown;
            break;

        case 40:    // down
        case 83:    // S
            this.keys["down"] = isDown;
            break;
    }

    e["yaw"] = 0;
    if (this.keys["left"])  e["yaw"] += 1;
    if (this.keys["right"]) e["yaw"] -= 1;

    e["thrust"] = 0;
    if (this.keys["up"])    e["thrust"] += 1;
    if (this.keys["down"])  e["thrust"] -= 1;

    return e;
}

Control.prototype.update = function(events) {
    for (var i = 0; i < events.length; i++) {
        var e = events[i];

        if (!(e._id in this.processed)) {
            this.processed[e._id] = true;
            this.tanks[e.tank_id].update(e);
        }
    }

    var control = this;
    this.network.queryForEvents(control.game_id, function(events){control.update(events)});
}

Control.prototype.tick = function() {
    // Bind display refresh
    var control = this;
    requestAnimFrame(function(){control.tick()});

    // Render scene
    this.render.drawScene();
    this.map.drawScene(this.render);

    for (tank in this.tanks) {
        this.tanks[tank].drawScene(this.render);
    }

    // Update data 
    for (tank in this.tanks) {
        this.tanks[tank].animate(this.render);
    }
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
    this.tanks["echo"] = new Tank(this.id);

    // Initialize Object Buffers 
    this.render.initShaders();
    this.map.initBuffers(this.render);

    for (tank in this.tanks) {
        this.tanks[tank].initBuffers(this.render);
    }

    this.render.initCanvas();

    // Start chattering
    var control = this;
    this.network.queryForEvents(control.game_id, function(events){control.update(events)});

    // Start ticking
    this.tick();
}
