const HttpServerError = require('./HttpServerError');
const requestApiAsync = require('./requestApiAsync');
const errors = require('request-promise/errors');

module.exports = async (req, config) => {
	let result;

	try {
		result = await requestApiAsync('post', '/ice_auth',
			{ applicationKey: config.web.applicationKey },
			{ 'X-Api-Version': 1.0 }
		);
	}
	catch (err) {
		throw new HttpServerError(500, `session creation error: ${err.message}`);
	}

	if (result.iceAuthKey == null) {
		throw new HttpServerError(500, `session creation error: ${result.response.message}`);
	}

	try {
		result = await requestApiAsync('post', '/ice_auth/authorize_basic',
			{
				screenName: req.body.screenName,
				password: req.body.password
			},
			{
				'X-Api-Version': 1.0,
				'X-Application-Key': config.web.applicationKey,
				'X-Access-Key': config.web.hostAccessKey,
				'X-Ice-Auth-Key': result.iceAuthKey
			}
		);
	}
	catch (err) {
		if (err instanceof errors.StatusCodeError) {
			throw new HttpServerError(400, `authentication error: ${err.response.message}`);
		}
		else {
			throw new HttpServerError(500, `session creation authentication error: ${err.message}`);
		}
	}

	if (result.accessKey == null) {
		throw new HttpServerError(400, `authentication error: ${result.response.message}`);
	}

	req.session.accessKey = result.accessKey;
};
