'use strict';

const server = require('./server');

process.on('unhandledRejection', console.dir);

server();
