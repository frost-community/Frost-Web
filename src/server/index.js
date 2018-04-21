const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const httpServer = require('./httpServer');
const i = require('./helpers/input-async');
const loadConfig = require('./helpers/load-config');
const request = require('request-promise');
const streamingServer = require('./streamingServer');
const ReconnectingWebSocket = require('./helpers/reconnecting-websocket-node');
const events = require('websocket-events');

const urlConfigFile = 'https://raw.githubusercontent.com/Frost-Dev/Frost/master/config.json';

const q = async str => (await i(str)).toLowerCase().indexOf('y') === 0;
const writeFile = promisify(fs.writeFile);

const isDebug = false;

/**
 * Webアプリケーションサーバ
 */
module.exports = async () => {
	try {
		console.log('+------------------+');
		console.log('| Frost Web Server |');
		console.log('+------------------+');

		console.log('loading config...');
		let config = loadConfig();
		if (config == null) {
			if (await q('config file is not found. generate now? (y/n) > ')) {
				const parent = await q('generate config.json in the parent directory of repository? (y/n) > ');
				const configPath = path.resolve(parent ? '../config.json' : 'config.json');
				const configJson = await request(urlConfigFile);
				await writeFile(configPath, configJson);
				console.log('generated. please edit config.json and restart frost-web.');
			}
			return;
		}

		console.log('connecting to streaming api as host ...');
		const hostApiConnection = await ReconnectingWebSocket.connect(`${config.web.apiBaseUrl}?access_token=${config.web.hostAccessToken}`);
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
