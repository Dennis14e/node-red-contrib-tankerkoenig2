const https = require('https');

module.exports = (RED) => {
    function Tankerkoenig2Config (config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.key = config.key;
    }

    RED.nodes.registerType('tankerkoenig2-config', Tankerkoenig2Config)


    function Tankerkoenig2Radius (config) {
        let node = this;
        RED.nodes.createNode(node, config);

        node.config = RED.nodes.getNode(config.config);
        if (!node.config || !node.config.key) {
            node.error('Configuration node is invalid');
            return false;
        }

        node.on('input', (msg) => {
            const params = {
                lat:    msg.latitude  || config.latitude,
                lng:    msg.longitude || config.longitude,
                rad:    msg.radius    || config.radius,
                sort:   msg.sort      || config.sort,
                type:   msg.fueltype  || config.fueltype,
                apikey: node.config.key,
            };

            const req_opts = {
                hostname: 'creativecommons.tankerkoenig.de',
                port: 443,
                path: '/json/list.php?' + new URLSearchParams(params).toString(),
                method: 'GET',
            };

            const req = https.request(req_opts, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        data = JSON.parse(data);

                        if (data.status === 'error') {
                            throw data.message;
                        }

                        msg.payload = data;
                        node.send(msg);
                    }
                    catch (error) {
                        node.error(error);
                    }
                });
            });
        });
    }

    RED.nodes.registerType('tankerkoenig2-radius', Tankerkoenig2Radius);
}
