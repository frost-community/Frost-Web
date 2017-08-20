'use strict';

const HttpServerError = require('./HttpServerError');
const requestApiAsync = require('./requestApiAsync');

module.exports = async (req, config) => {
	let result;

	try {
		result = await requestApiAsync('post', '/ice_auth', {
			applicationKey: config.web.applicationKey
		}, {
			'X-Api-Version': 1.0
		});
	}
	catch(err) {
		throw new HttpServerError(500, `session creation error: ${err.message}`);
	}

	if (result.iceAuthKey == null) {
		throw new HttpServerError(500, `session creation error: ${result.response.message}`);
	}

	try {
		result = await requestApiAsync('post', '/ice_auth/authorize_basic', {
			screenName: req.body.screenName,
			password: req.body.password
		}, {
			'X-Api-Version': 1.0,
			'X-Application-Key': config.web.applicationKey,
			'X-Access-Key': config.web.hostAccessKey,
			'X-Ice-Auth-Key': result.iceAuthKey
		});
	}
	catch(err) {
		throw new HttpServerError(500, `session creation authorize error: ${err.message}`);
	}

	if (result.accessKey == null) {
		throw new HttpServerError(400, `authentication error: ${result.response.message}`);
	}

	req.session.accessKey = result.accessKey;
};
