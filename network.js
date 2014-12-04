// Wrapper for messages that go across the network...
function Network(control) {
    this.pod = crosscloud.connect();
    this.control = control;
}

Network.prototype.broadcast = function(e) {
    e.tank_id = this.control.id;
    e.game_id = this.control.game_id;

    this.pod.push(e);
}

Network.prototype.queryForEvents = function(callback) {
    this.pod.query()
        .filter(this.keyPressHash())
        .onAllResults(callback)
        .start();
}

Network.prototype.keyPressHash = function() {
    return {
        tank_id: { "$exists": true },
        game_id: this.control.game_id,
        yaw: { "$exists": true },
        thrust: { "$exists": true }
    }
}

