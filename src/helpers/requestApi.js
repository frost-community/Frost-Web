'use strict';

const config = require('./loadConfig')();
const request = require('request');
const path = require('path');

module.exports = (method, endpoint, body, headers) => new Promise((resolve, reject) => {
	headers = headers == null ? {
		'X-Application-Key': config.web.applicationKey,
		'X-Access-Key': config.web.hostAccessKey,
		'Content-Type': 'application/json'
	} : headers;
	request({
		method: method,
		url: `http://${path.join(config.api.host+':'+config.api.port, endpoint)}`,
		json: true,
		headers: headers,
		body: body
	}, (err, res, b) => {
		if (err)
			reject(err);

		resolve({res: res, body: b});
	});
});
