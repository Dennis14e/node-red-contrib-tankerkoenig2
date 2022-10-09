const helper = require('node-red-node-test-helper');

const configNode = require('../nodes/10-config');
const radiusNode = require('../nodes/20-radius');

// Config
const config = {
    configNode: {
        id: 'nc1',
        type: 'tankerkoenig2-config',
    },
    credentials: {
        nc1: {
            key: '00000000-0000-0000-0000-000000000002',
        },
    },
};

// Berlin
const test_location = {
    lat: 52.520008,
    lng: 13.404954,
};

helper.init(require.resolve('node-red'));

describe('tankerkoenig2-radius node', () => {
    beforeEach((done) => {
        helper.startServer(done);
    });

    afterEach((done) => {
        helper.unload().then(() => {
            helper.stopServer(done);
        });
    });

    it('should be loaded', (done) => {
        const flow = [
            {
                id: 'n1',
                type: 'tankerkoenig2-radius',
                name: 'tankerkoenig2-radius',
                configNode: 'nc1',
            },
            config.configNode,
        ];

        helper.load([ radiusNode, configNode ], flow, config.credentials, () => {
            const n1 = helper.getNode('n1');

            try {
                expect(n1).toHaveProperty('name', 'tankerkoenig2-radius');
                done();
            }
            catch (err) {
                done(err);
            }
        });
    });

    it('should have valid config', (done) => {
        const flow = [
            {
                id: 'n1',
                type: 'tankerkoenig2-radius',
                name: 'tankerkoenig2-radius',
                configNode: 'nc1',
            },
            config.configNode,
        ];

        helper.load([ radiusNode, configNode ], flow, config.credentials, () => {
            const n1 = helper.getNode('n1');

            console.log(n1);

            try {
                expect(n1).toHaveProperty('configNode', 'nc1');
                expect(n1).toHaveProperty('config');
                expect(n1.config).toHaveProperty('credentials');
                expect(n1.config.credentials).toHaveProperty('key', config.credentials.nc1.key);
                done();
            }
            catch (err) {
                done(err);
            }
        });
    });
});
