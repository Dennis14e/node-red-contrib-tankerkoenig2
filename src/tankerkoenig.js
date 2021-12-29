module.exports = function (RED) {
    function Tankerkoenig2Config (config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.key = config.key;
    }

    RED.nodes.registerType('tankerkoenig2-config', Tankerkoenig2Config)


    function Tankerkoenig2Radius (config) {
        RED.nodes.createNode(this, config);

        this.config = RED.nodes.getNode(config.config);
        if (!this.config) {
            return false;
        }

        this.on('input', function (msg) {
            msg.payload = config;
            msg.payload.config = this.config;

            this.send(msg);
        });
    }

    RED.nodes.registerType('tankerkoenig2-radius', Tankerkoenig2Radius);
}
