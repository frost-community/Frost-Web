const httpServer = require('./httpServer');
const streamingServer = require('./streamingServer');
const ReconnectingWebSocket = require('./helpers/reconnecting-websocket-node');
const events = require('websocket-events');
const loadConfig = require('./helpers/load-config');
const MongoAdapter = require('./helpers/MongoAdapter');

const isDebug = false;

/**
 * Webアプリケーションサーバ
 */
module.exports = async () => {
	const log = (...args) => {
		console.log(...args);
	};
	try {
		log('+------------------+');
		log('| Frost Web Server |');
		log('+------------------+');

		log('loading config file...');
		let config = loadConfig();
		if (config == null) {
			log('config file is not found. please refer to .configs/README.md');
			return;
		}

		log('connecting database ...');
		const db = await MongoAdapter.connect(
			config.database.host,
			config.database.database,
			config.database.username,
			config.database.password);

		log('connecting to streaming api as host ...');
		const hostApiConnection = await ReconnectingWebSocket.connect(`ws://${config.apiHost}?access_token=${config.hostAccessToken}`);
		hostApiConnection.on('error', err => {
			if (err.message.indexOf('ECONNRESET') != -1) {
				return;
			}
			log('host apiConnection error:', err);
		});
		events(hostApiConnection);

		log('starting http server ...');
		const { http, sessionStore } = await httpServer(db, hostApiConnection, isDebug, config);

		log('starting streaming server ...');
		streamingServer(http, sessionStore, isDebug, config);

		log('initialized');
	}
	catch (err) {
		log('unprocessed error:', err); // † Last Stand †
	}
};
