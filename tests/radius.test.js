const helper = require('node-red-node-test-helper');
const tankerkoenig2 = require('../src/tankerkoenig');

helper.init(require.resolve('node-red'));

describe('tankerkoenig2-radius', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [{
            id: 'n0',
            type: 'tankerkoenig2-config',
        }, {
            id: 'n1',
            type: 'tankerkoenig2-radius',
            name: 'tankerkoenig2-radius',
            configNode: 'n0',
        }];

        helper.load(tankerkoenig2, flow, function () {
            const n0 = helper.getNode('n0');
            const n1 = helper.getNode('n1');

            try {
                console.log(n1);
                expect(n1).toHaveProperty('name', 'tankerkoenig2-radius');
                done();
            }
            catch (err) {
                done(err);
            }
        });
    });

    it('should be loaded2', function (done) {
        const flow = [{
            id: 'n1',
            type: 'tankerkoenig2-radius',
            name: 'tankerkoenig2-radius',
            latitude: 52.520008,
            longitude: 13.404954,
            radius: 5,
            fuelType: 'all',
            sort: 'dist',
        }];

        helper.load(tankerkoenig2, flow, function () {
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
});
