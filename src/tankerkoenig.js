const https = require('https');

module.exports = (RED) => {
    function Tankerkoenig2Config (config) {
        RED.nodes.createNode(this, config);
    }

    RED.nodes.registerType('tankerkoenig2-config', Tankerkoenig2Config, {
        credentials: {
            key: {
                type: 'text',
            },
        },
    });


    function Tankerkoenig2Radius (config) {
        let node = this;
        RED.nodes.createNode(node, config);

        if (!node.credentials.key) {
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

            res = Tankerkoenig2Request('/json/list.php', params);
            node.log(res);

            if (res.status === 'error') {
                node.error(res.data);
                return;
            }

            msg.payload = res.data;
            node.send(msg);
        });
    }

    RED.nodes.registerType('tankerkoenig2-radius', Tankerkoenig2Radius);


    function Tankerkoenig2Request (path, params) {
        let res = {};

        const req_opts = {
            hostname: 'creativecommons.tankerkoenig.de',
            port: 443,
            path: path + '?' + new URLSearchParams(params).toString(),
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

                    res = {
                        status: 'ok',
                        data: data,
                    };
                }
                catch (error) {
                    res = {
                        status: 'error',
                        data: error,
                    };
                }
            });
        });

        req.on('error', (error) => {
            res = {
                status: 'error',
                data: error,
            };
        });

        req.end();

        return res;
    }
}
