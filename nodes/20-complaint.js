
module.exports = (RED) => {
    'use strict';

    const Tankerkoenig = require('../lib/tankerkoenig');

    function complaintNode (config) {
        RED.nodes.createNode(this, config);
        const node = this;

        [
            'configNode',
            'uuid',
            'complaintType',
            'correction',
            'timestamp',
            'name',
        ].forEach(k => node[k] = config[k]);

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

            Tankerkoenig.Request('POST', 'complaint.php', params)
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

    RED.nodes.registerType('tankerkoenig2-complaint', complaintNode);
};
