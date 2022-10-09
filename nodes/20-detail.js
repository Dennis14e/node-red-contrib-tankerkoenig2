
module.exports = (RED) => {
    'use strict';

    const Tankerkoenig = require('../lib/tankerkoenig');

    function detailNode (config) {
        RED.nodes.createNode(this, config);
        const node = this;

        [
            'configNode',
            'uuid',
            'name',
        ].forEach(k => node[k] = config[k]);

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

            Tankerkoenig.Request('GET', 'detail.php', params)
                .then((res) => {
                    // Restructure station
                    if (res.station) {
                        res.station = Tankerkoenig.RewriteStation(res.station);
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

    RED.nodes.registerType('tankerkoenig2-detail', detailNode);
};
