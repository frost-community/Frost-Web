const appServer = require('./server');

process.on('unhandledRejection', (err) => {
	console.log('Unprocessed Promise Error:', err); // † Last Stand † (Promise)
});

try {
	appServer();
}
catch (err) {
	console.log('Unprocessed Error:', err); // † Last Stand †
}
