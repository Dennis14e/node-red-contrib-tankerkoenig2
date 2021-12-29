module.exports = function (RED) {
    function Tankerkoenig2Config (config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.key = config.key;
    }

    RED.nodes.registerType('tankerkoenig2-config', Tankerkoenig2Config)


    function Tankerkoenig2Radius (config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            msg.payload = config;
            node.send(msg);
        });
    }

    RED.nodes.registerType('tankerkoenig2-radius', Tankerkoenig2Radius);
}
