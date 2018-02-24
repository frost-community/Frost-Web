const fs = require('fs');
const httpServer = require('./httpServer');
const i = require('./helpers/input-async');
const loadConfig = require('./helpers/load-config');
const requestAsync = require('request-promise');
const streamingServer = require('./streamingServer');

const urlConfigFile = 'https://raw.githubusercontent.com/Frost-Dev/Frost/master/config.json';
const questionResult = (ans) => (ans.toLowerCase()).indexOf('y') === 0;

/**
 * Webアプリケーションサーバ
 */
module.exports = async () => {
	console.log('+------------------+');
	console.log('| Frost Web Server |');
	console.log('+------------------+');

	console.log('loading config...');
	let config = loadConfig();
	if (config == null) {
		if (questionResult(await i('config file is not found. generate now? (y/n) > '))) {
			let configPath;

			if (questionResult(await i('generate config.json in the parent directory of repository? (y/n) > '))) {
				configPath = `${process.cwd()}/../config.json`;
			}
			else {
				configPath = `${process.cwd()}/config.json`;
			}

			const configJson = await requestAsync(urlConfigFile);
			fs.writeFileSync(configPath, configJson);
		}
		config = loadConfig();
	}

	if (config == null) {
		console.log('failed to loading config');
		return;
	}
	console.log('loaded config');

	const { http, sessionStore } = await httpServer(false, config);
	streamingServer(http, sessionStore, false, config);

	console.log('init complete');
};
