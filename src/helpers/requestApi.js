'use strict';

const path = require('path');
const config = require('./loadConfig')();
const request = require('./requestAsync');

module.exports = async (method, endpoint, body, headers) => {
	let requestHeaders = {'Content-Type': 'application/json'};
	requestHeaders = Object.assign(requestHeaders, headers == null ? {} : headers);
	return await request(`http://${path.join(config.api.host+':'+config.api.port, endpoint)}`, {
		method: method,
		json: true,
		headers: requestHeaders,
		body: body
	});
};
