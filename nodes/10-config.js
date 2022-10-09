module.exports = (RED) => {
    'use strict';

    class configNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.name = config.name;
            this.key = this.credentials.key ?? config.key ?? '';
        }
    }

    RED.nodes.registerType('tankerkoenig2-config', configNode, {
        credentials: {
            key: {
                type: 'text',
            },
        },
    });
};
