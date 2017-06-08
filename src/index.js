'use strict';

const server = require('./server');

process.on('unhandledRejection', console.dir); // † 最後の砦 †

server();
