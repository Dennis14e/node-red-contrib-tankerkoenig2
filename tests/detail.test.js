const { matchers } = require('jest-json-schema');
const helper = require('node-red-node-test-helper');

expect.extend(matchers);


const configNode = require('../nodes/10-config');
const radiusNode = require('../nodes/20-radius');
const detailNode = require('../nodes/20-detail');

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

const schema = {
    properties: {
        ok: { type: 'boolean' },
        license: { type: 'string' },
        data: { type: 'string' },
        message: { type: 'string' },
        status: { type: 'string' },
        station: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                brand: { type: 'string' },
                street: { type: 'string' },
                houseNumber: { type: 'string' },
                postCode: { type: 'number' },
                place: { type: 'string' },
                openingTimes: { type: 'array' },
                overrides: { type: 'array' },
                wholeDay: { type: 'boolean' },
                isOpen: { type: 'boolean' },
                lat: { type: 'number' },
                lng: { type: 'number' },
                state: {},
                prices: {
                    type: 'object',
                    properties: {
                        diesel: { type: 'number' },
                        e5: { type: 'number' },
                        e10: { type: 'number' },
                    },
                    additionalProperties: false,
                },
            },
            required: [
                'id',
                'name',
                'brand',
                'street',
                'houseNumber',
                'postCode',
                'place',
                'openingTimes',
                'overrides',
                'wholeDay',
                'isOpen',
                'lat',
                'lng',
                'prices',
            ],
            additionalProperties: false,
        },
    },
    required: [
        'ok',
        'license',
        'data',
        'status',
        'station',
    ],
    additionalProperties: false,
};

helper.init(require.resolve('node-red'));

describe('tankerkoenig2-detail node', () => {
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
                type: 'tankerkoenig2-detail',
                name: 'tankerkoenig2-detail',
                configNode: 'nc1',
            },
            config.configNode,
        ];

        helper.load([ detailNode, configNode ], flow, config.credentials, () => {
            const n1 = helper.getNode('n1');

            try {
                expect(n1).toHaveProperty('name', 'tankerkoenig2-detail');
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
                type: 'tankerkoenig2-detail',
                name: 'tankerkoenig2-detail',
                configNode: 'nc1',
            },
            config.configNode,
        ];

        helper.load([ detailNode, configNode ], flow, config.credentials, () => {
            const n1 = helper.getNode('n1');

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

    it('should return valid json', (done) => {
        const flow = [
            {
                id: 'n1',
                type: 'tankerkoenig2-radius',
                name: 'tankerkoenig2-radius',
                configNode: 'nc1',
                wires: [[ 'nh1' ]],
            },
            {
                id: 'n2',
                type: 'tankerkoenig2-detail',
                name: 'tankerkoenig2-detail',
                configNode: 'nc1',
                wires: [[ 'nh2' ]],
            },
            {
                id: 'nh1',
                type: 'helper',
            },
            {
                id: 'nh2',
                type: 'helper',
            },
            config.configNode,
        ];

        helper.load([ radiusNode, detailNode, configNode ], flow, config.credentials, () => {
            const n1 = helper.getNode('n1');
            const n2 = helper.getNode('n2');
            const nh1 = helper.getNode('nh1');
            const nh2 = helper.getNode('nh2');

            nh2.on('input', (msg) => {
                try {
                    expect(msg.payload).toMatchSchema(schema);
                    done();
                }
                catch (err) {
                    done(err);
                }
            });

            nh1.on('input', (msg) => {
                if (!msg.payload.stations) {
                    done(msg);
                }

                n2.receive({
                    payload: {
                        uuid: msg.payload.stations[0].id,
                    },
                });
            });

            n1.receive({
                payload: {
                    latitude: test_location.lat,
                    longitude: test_location.lng,
                    radius: 15,
                },
            });
        });
    });
});
