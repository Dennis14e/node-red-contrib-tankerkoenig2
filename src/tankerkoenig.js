const util = require('util');
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

        node.config = RED.nodes.getNode(config.config);
        if (!node.config || !node.config.credentials.key) {
            node.error('Configuration node is invalid');
            return false;
        }

        node.on('input', async (msg) => {
            const params = {
                lat:    msg.latitude  || config.latitude,
                lng:    msg.longitude || config.longitude,
                rad:    msg.radius    || config.radius,
                sort:   msg.sort      || config.sort,
                type:   msg.fueltype  || config.fueltype,
                apikey: node.config.credentials.key,
            };

            const res = await Tankerkoenig2Request('/json/list.php', params);
            node.log(util.inspect(res));

            if (res.status === 'error') {
                node.error(res.data);
                return;
            }

            msg.payload = res.data;
            node.send(msg);
        });
    }

    RED.nodes.registerType('tankerkoenig2-radius', Tankerkoenig2Radius);


    async function Tankerkoenig2Request (path, params) {
        return new Promise((resolve, reject) => {
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

                        resolve({
                            status: 'ok',
                            data: data,
                        });
                    }
                    catch (error) {
                        reject({
                            status: 'error',
                            data: error,
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject({
                    status: 'error',
                    data: error,
                });
            });

            req.end();
        });
    }
}
