'use strict';

const path = require('path');
const config = require('./loadConfig')();
const request = require('./requestAsync');

module.exports = async (method, endpoint, body, headers) => {
	let requestHeaders = {'Content-Type': 'application/json'};
	requestHeaders = Object.assign(requestHeaders, headers == null ? {} : headers);
	return await request(`https://${config.web.apiHost}${endpoint}`, {
		method: method,
		json: true,
		headers: requestHeaders,
		body: body
	});
};
