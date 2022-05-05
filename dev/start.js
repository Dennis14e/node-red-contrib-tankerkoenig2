'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const RED = require('node-red');


const app = express();
const server = http.createServer(app);


const settings = {
    httpAdminRoot: '/',
    httpNodeRoot: false,
    userDir: path.resolve(__dirname, 'data'),
    functionGlobalContext: {},
};


RED.init(server, settings);

app.use(settings.httpAdminRoot, RED.httpAdmin);

server.listen(8000);
server.on('listening', () => {
    console.log('Server started on port %d at %s', server.address().port, server.address().address);
});

RED.start();
