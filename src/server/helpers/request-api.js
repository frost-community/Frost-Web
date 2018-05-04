const config = require('./load-config')(); // TODO: di
const request = require('request-promise');

/**
 * REST APIにリクエストします。
 */
module.exports = async (method, endpoint, body, headers) => {
	let requestHeaders = { 'Content-Type': 'application/json' };
	requestHeaders = Object.assign(requestHeaders, headers == null ? {} : headers);

	return await request(`${config.web.apiBaseUrl}${endpoint}`, {
		method: method,
		json: true,
		headers: requestHeaders,
		body: body
	});
};
