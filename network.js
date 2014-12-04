// Wrapper for crosscloud
function Network() {
    this.pod = crosscloud.connect();
    this.messageCount = 0;
}

Network.prototype.broadcast = function(e) {
    this.pod.push(e);
}

Network.prototype.queryForEvents = function(id, callback) {
    this.messageCount += 1;

    this.pod.query()
        .filter({
            tank_id: { "$exists": true },
            game_id: id,
            yaw: { "$exists": true },
            thrust: { "$exists": true },
        })
        .onAllResults(callback)
        .start();
}
