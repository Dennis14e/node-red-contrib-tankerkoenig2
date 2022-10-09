
module.exports = (RED) => {
    'use strict';

    const Tankerkoenig = require('../lib/tankerkoenig');

    function radiusNode (config) {
        RED.nodes.createNode(this, config);
        const node = this;

        [
            'configNode',
            'latitude',
            'longitude',
            'radius',
            'fuelType',
            'sort',
            'name',
        ].forEach(k => node[k] = config[k]);

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

            Tankerkoenig.Request('GET', 'list.php', params)
                .then((res) => {
                    // Restructure stations
                    if (res.stations) {
                        for (let i = 0; i < res.stations.length; i++) {
                            res.stations[i] = Tankerkoenig.RewriteStation(res.stations[i], params.type);
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

    RED.nodes.registerType('tankerkoenig2-radius', radiusNode);
};
