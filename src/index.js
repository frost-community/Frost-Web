const server = require('./server');

process.on('unhandledRejection', err => console.log(err)); // † Last Stand † (Promise)
Error.stackTraceLimit = 20;

server();
