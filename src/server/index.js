const path = require('path');
const httpServer = require('./httpServer');
const streamingServer = require('./streamingServer');
const ReconnectingWebSocket = require('./helpers/reconnecting-websocket-node');
const events = require('websocket-events');

const isDebug = false;

/**
 * Webアプリケーションサーバ
 */
module.exports = async () => {
	try {
		console.log('+------------------+');
		console.log('| Frost Web Server |');
		console.log('+------------------+');

		console.log('loading config file...');
		let config = require(path.resolve('.configs/server-config.json'));
		if (config == null) {
			console.log('config file is not found. please refer to .configs/README.md');
			return;
		}

		console.log('connecting to streaming api as host ...');
		const hostApiConnection = await ReconnectingWebSocket.connect(`ws://${config.apiHost}?access_token=${config.hostAccessToken}`);
		hostApiConnection.on('error', err => {
			if (err.message.indexOf('ECONNRESET') != -1) {
				return;
			}
			console.log('host apiConnection error:', err);
		});
		events(hostApiConnection);

		console.log('starting http server ...');
		const { http, sessionStore } = await httpServer(hostApiConnection, isDebug, config);
		streamingServer(http, sessionStore, isDebug, config);

		console.log('init complete');
	}
	catch (err) {
		console.log('Unprocessed Server Error:', err); // † Last Stand †
	}
};
