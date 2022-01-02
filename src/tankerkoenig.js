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
            'fuelType',
            'sort',
            'name',
        ].forEach(k => node[k] = input[k]);

        node.config = RED.nodes.getNode(node.configNode);
        if (!node.config || !node.config.key) {
            node.config = { key: null };
        }

        node.on('input', async (msg) => {
            msg.payload = msg.payload || {};
            const params = {
                lat:    msg.payload.latitude  || node.latitude,
                lng:    msg.payload.longitude || node.longitude,
                rad:    msg.payload.radius    || node.radius,
                sort:   msg.payload.sort      || node.sort       || 'dist',
                type:   msg.payload.fuelType  || node.fuelType   || 'all',
                apikey: node.config.key,
            };

            Tankerkoenig2Request('GET', 'list.php', params)
                .then((res) => {
                    // Restructure stations
                    if (res.stations) {
                        for (let i = 0; i < res.stations.length; i++) {
                            res.stations[i] = Tankerkoenig2RewriteStation(res.stations[i], params.type);
                        }
                    }

                    msg.payload = res;
                })
                .catch((error) => {
                    msg.payload = error;
                    node.error(error);
                })
                .finally(() => {
                    node.send(msg);
                });
        });
    }

    RED.nodes.registerType('tankerkoenig2-radius', Tankerkoenig2Radius);


    function Tankerkoenig2Prices (input) {
        RED.nodes.createNode(this, input);
        const node = this;

        [
            'configNode',
            'uuid',
            'name',
        ].forEach(k => node[k] = input[k]);

        node.config = RED.nodes.getNode(node.configNode);
        if (!node.config || !node.config.key) {
            node.config = { key: null };
        }

        node.on('input', async (msg) => {
            msg.payload = msg.payload || {};
            const params = {
                ids:    msg.payload.uuid || node.uuid,
                apikey: node.config.key,
            };

            if (Array.isArray(params.ids)) {
                params.ids = params.ids.join(',');
            }

            Tankerkoenig2Request('GET', 'prices.php', params)
                .then((res) => {
                    msg.payload = res;
                })
                .catch((error) => {
                    msg.payload = error;
                    node.error(error);
                })
                .finally(() => {
                    node.send(msg);
                });
        });
    }

    RED.nodes.registerType('tankerkoenig2-prices', Tankerkoenig2Prices);


    function Tankerkoenig2Detail (input) {
        RED.nodes.createNode(this, input);
        const node = this;

        [
            'configNode',
            'uuid',
            'name',
        ].forEach(k => node[k] = input[k]);

        node.config = RED.nodes.getNode(node.configNode);
        if (!node.config || !node.config.key) {
            node.config = { key: null };
        }

        node.on('input', async (msg) => {
            msg.payload = msg.payload || {};
            const params = {
                id:     msg.payload.uuid || node.uuid,
                apikey: node.config.key,
            };

            Tankerkoenig2Request('GET', 'detail.php', params)
                .then((res) => {
                    // Restructure station
                    if (res.station) {
                        res.station = Tankerkoenig2RewriteStation(res.station);
                    }

                    msg.payload = res;
                })
                .catch((error) => {
                    msg.payload = error;
                    node.error(error);
                })
                .finally(() => {
                    node.send(msg);
                });
        });
    }

    RED.nodes.registerType('tankerkoenig2-detail', Tankerkoenig2Detail);


    function Tankerkoenig2Complaint (input) {
        RED.nodes.createNode(this, input);
        const node = this;

        [
            'configNode',
            'uuid',
            'complaintType',
            'correction',
            'timestamp',
            'name',
        ].forEach(k => node[k] = input[k]);

        node.config = RED.nodes.getNode(node.configNode);
        if (!node.config || !node.config.key) {
            node.config = { key: null };
        }

        node.on('input', async (msg) => {
            msg.payload = msg.payload || {};
            const params = {
                id:         msg.payload.uuid          || node.uuid,
                type:       msg.payload.complaintType || node.complaintType,
                correction: msg.payload.correction    || node.correction     || false,
                ts:         msg.payload.timestamp     || node.timestamp      || false,
                apikey:     node.config.key,
            };

            if (!params.correction) {
                delete params.correction;
            }

            if (!params.ts) {
                delete params.ts;
            }

            Tankerkoenig2Request('POST', 'complaint.php', params)
                .then((res) => {
                    msg.payload = res;
                })
                .catch((error) => {
                    msg.payload = error;
                    node.error(error);
                })
                .finally(() => {
                    node.send(msg);
                });
        });
    }

    RED.nodes.registerType('tankerkoenig2-complaint', Tankerkoenig2Complaint);


    async function Tankerkoenig2Request (method, path, params) {
        return new Promise((resolve, reject) => {
            const req_opts = {
                hostname: 'creativecommons.tankerkoenig.de',
                port: 443,
                method: method,
                path: '/json/' + path,
            };

            switch (method) {
                case 'GET':
                    req_opts.path += '?' + new URLSearchParams(params).toString();
                    break;

                case 'POST':
                    params = new URLSearchParams(params).toString();
                    req_opts.headers = {
                        'Content-Type':   'application/x-www-form-urlencoded',
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

                        // complaint has no status
                        if (!data.status) {
                            data.status = 'ok';
                        }

                        resolve(data);
                    }
                    catch (error) {
                        reject({
                            ok: false,
                            status: 'error',
                            message: data.message || error,
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (method === 'POST') {
                req.write(params);
            }

            req.end();
        });
    }


    function Tankerkoenig2RewriteStation (station, fuelType = false) {
        station.prices = {};

        for (const key of Object.keys(station)) {
            if ([ 'e5', 'e10', 'diesel' ].includes(key)) {
                station.prices[key] = station[key];
                delete station[key];
            }
        }

        if (station.price && fuelType) {
            station.prices[fuelType] = station.price;
            delete station.price;
        }

        return station;
    }
};
