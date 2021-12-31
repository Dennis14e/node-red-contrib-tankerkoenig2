const https = require('https');

module.exports = (RED) => {
    'use strict';

    function Tankerkoenig2Config (input) {
        RED.nodes.createNode(this, input);
        const node = this;

        node.key = this.credentials.key;
    }

    RED.nodes.registerType('tankerkoenig2-config', Tankerkoenig2Config, {
        credentials: {
            key: {
                type: 'text',
            },
        },
    });


    function Tankerkoenig2Radius (input) {
        RED.nodes.createNode(this, input);
        const node = this;

        [
            'configNode',
            'latitude',
            'longitude',
            'radius',
            'sort',
            'fuelType',
            'name',
        ].forEach(k => node[k] = input[k]);

        node.config = RED.nodes.getNode(node.configNode);
        if (!node.config || !node.config.key) {
            node.error('Configuration node is invalid');
            return;
        }

        node.on('input', async (msg) => {
            const params = {
                lat:    msg.latitude  || node.latitude,
                lng:    msg.longitude || node.longitude,
                rad:    msg.radius    || node.radius,
                sort:   msg.sort      || node.sort,
                type:   msg.fuelType  || node.fuelType,
                apikey: node.config.key,
            };

            const res = await Tankerkoenig2Request('GET', '/json/list.php', params);

            if (res.status !== 'ok') {
                node.error(res.data);
                return;
            }

            msg.payload = res.data;
            node.send(msg);
        });
    }

    RED.nodes.registerType('tankerkoenig2-radius', Tankerkoenig2Radius);


    function Tankerkoenig2Prices (input) {
        RED.nodes.createNode(this, input);
        const node = this;

        [
            'configNode',
            'ids',
            'name',
        ].forEach(k => node[k] = input[k]);

        node.config = RED.nodes.getNode(node.configNode);
        if (!node.config || !node.config.key) {
            node.error('Configuration node is invalid');
            return;
        }

        node.on('input', async (msg) => {
            const params = {
                ids:    msg.ids || node.ids,
                apikey: node.config.key,
            };

            const res = await Tankerkoenig2Request('GET', '/json/prices.php', params);

            if (res.status !== 'ok') {
                node.error(res.data);
                return;
            }

            msg.payload = res.data;
            node.send(msg);
        });
    }

    RED.nodes.registerType('tankerkoenig2-prices', Tankerkoenig2Prices);


    function Tankerkoenig2Detail (input) {
        RED.nodes.createNode(this, input);
        const node = this;

        [
            'configNode',
            'id',
            'name',
        ].forEach(k => node[k] = input[k]);

        node.config = RED.nodes.getNode(node.configNode);
        if (!node.config || !node.config.key) {
            node.error('Configuration node is invalid');
            return;
        }

        node.on('input', async (msg) => {
            const params = {
                id:     msg.id || node.id,
                apikey: node.config.key,
            };

            const res = await Tankerkoenig2Request('GET', '/json/detail.php', params);

            if (res.status !== 'ok') {
                node.error(res.data);
                return;
            }

            msg.payload = res.data;
            node.send(msg);
        });
    }

    RED.nodes.registerType('tankerkoenig2-detail', Tankerkoenig2Detail);


    function Tankerkoenig2Complaint (input) {
        RED.nodes.createNode(this, input);
        const node = this;

        [
            'configNode',
            'id',
            'complaintType',
            'correction',
            'timestamp',
            'name',
        ].forEach(k => node[k] = input[k]);

        node.config = RED.nodes.getNode(node.configNode);
        if (!node.config || !node.config.key) {
            node.error('Configuration node is invalid');
            return;
        }

        node.on('input', async (msg) => {
            const params = {
                id:         msg.id            || node.id,
                type:       msg.complaintType || node.complaintType,
                correction: msg.correction    || node.correction     || false,
                ts:         msg.timestamp     || node.timestamp      || false,
                apikey:     node.config.key,
            };

            if (!params.correction) {
                delete params.correction;
            }

            if (!params.ts) {
                delete params.ts;
            }

            const res = await Tankerkoenig2Request('POST', '/json/complaint.php', params);

            if (res.status !== 'ok') {
                node.error(res.data);
                return;
            }

            msg.payload = res.data;
            node.send(msg);
        });
    }

    RED.nodes.registerType('tankerkoenig2-complaint', Tankerkoenig2Complaint);


    async function Tankerkoenig2Request (method, path, params) {
        return new Promise((resolve, reject) => {
            const req_opts = {
                hostname: 'creativecommons.tankerkoenig.de',
                port: 443,
                method: method,
                path: path,
            };

            switch (method) {
                case 'GET':
                    req_opts.path += '?' + new URLSearchParams(params).toString();
                    break;

                case 'POST':
                    params = JSON.stringify(params);
                    req_opts.headers = {
                        'Content-Type':   'application/json',
                        'Content-Length': params.length,
                    };
                    break;
            }

            const req = https.request(req_opts, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        data = JSON.parse(data);

                        if (!data.ok) {
                            throw data.message || 'unknown error';
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

            if (method === 'POST') {
                req.write(params);
            }

            req.end();
        });
    }
}
