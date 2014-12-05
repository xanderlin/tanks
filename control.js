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
    this.network = new Network(this);

    // Set id...?
    this.game_id = "test_" + Math.floor((Math.random() * 10000) + 1);
    this.game_id = "test_mp_10"
    this.id = "tank_" + Math.floor((Math.random() * 10000) + 1);
}

// Listen shell function
Control.prototype.listen = function() {
    var control = this;
    this.network.queryForEvents(function(events){control.update(events)});
}

Control.prototype.handleKey = function(event, isDown) {
    e = this.translateKeyEvent(event, isDown);
    this.tanks[this.id].update(e);
    this.network.broadcast(e);
}

Control.prototype.translateKeyEvent = function(event, isDown) {
    var e = {};
    var tank = this.tanks[this.id];

    e["rTurret"] = tank.rTurret;
    e["rBody"] = tank.rBody;

    e["xPos"] = tank.xPos;
    e["yPos"] = tank.yPos;
    e["zPos"] = tank.zPos;

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

    // Left and Right both down mean you go nowhere
    e["yaw"] = 0;
    if (this.keys["left"])  e["yaw"] += 1;
    if (this.keys["right"]) e["yaw"] -= 1;

    e["thrust"] = 0;
    if (this.keys["up"])    e["thrust"] += 1;
    if (this.keys["down"])  e["thrust"] -= 1;

    return e;
}

// Updates the tanks with the events floating around the pods
// We are only going to use the most recent event from each tank
Control.prototype.update = function(events) {
    var queue = {};

    for (var i = 0; i < events.length; i++) {
        var e = events[i];

        // Your tank is bound to keys
        if (e.tank_id == this.id) {
            continue;
        }

        if (!(e.tank_id in queue)) {
            queue[e.tank_id] = e;
        }

        if (queue[e.tank_id].timestamp < e.timestamp) {
            queue[e.tank_id] = e;
        }
    }
   
    // This will double process events...
    // TODO make double processing okay. 
    for (tank_id in queue) {
        var e = queue[tank_id];

        if (!(e._id in this.processed)) {
            this.processed[e._id] = true;

            if (!(tank_id in this.tanks)) {
                console.log("A new challenger appears!");
                this.tanks[tank_id] = new Tank(this.render);
            }

            this.tanks[tank_id].update(e);
        }
    }

    //Debug Only
    this.queue = queue;

    this.listen();
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

    // Initialize Object
    this.map = new Map();

    this.render.initShaders();
    this.map.initBuffers(this.render);
    this.tanks[this.id] = new Tank(this.render);

    this.render.initCanvas();

    // Start chattering
    this.listen();

    // Start ticking
    this.tick();
}
