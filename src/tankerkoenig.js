module.exports = (RED) => {
    const Tankerkoenig2Config = (config) => {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.key = config.key;
    }

    RED.nodes.registerType('tankerkoenig2-config', Tankerkoenig2Config)


    const Tankerkoenig2Radius = (config) => {
        let node = this;
        RED.nodes.createNode(node, config);

        node.config = RED.nodes.getNode(config.config);
        if (!node.config || !node.config.key) {
            node.error('Configuration node is invalid');
            return false;
        }

        node.on('input', (msg) => {


            node.send(msg);
        });
    }

    RED.nodes.registerType('tankerkoenig2-radius', Tankerkoenig2Radius);
}
