'use strict';

const request = require('request');

module.exports = (url, options) => new Promise((resolve, reject) => {
	request(url, options, (err, res, body) => {
		if (err) {
			reject(err);
		}

		console.log(require('util').inspect(res));

		resolve({res: res, body: body});
	});
});
