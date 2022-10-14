const https = require('https');

module.exports = class Tankerkoenig {
    static async Request(method, path, params) {
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

    static RewriteStation(station, fuelType = false) {
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
