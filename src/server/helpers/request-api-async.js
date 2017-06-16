'use strict';

const config = require('./load-config')(); // TODO: di
const requestAsync = require('request-promise');

/**
 * REST APIにリクエストします。
 */
module.exports = (method, endpoint, body, headers) => {
	let requestHeaders = {'Content-Type': 'application/json'};
	requestHeaders = Object.assign(requestHeaders, headers == null ? {} : headers);
	return requestAsync(`${config.web.apiBaseUrl}${endpoint}`, {
		method: method,
		json: true,
		headers: requestHeaders,
		body: body
	});
};
