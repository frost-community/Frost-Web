const ioServer = require('socket.io');
const ioClient = require('socket.io-client');
const getSessionFromCookieAsync = require('./helpers/get-session-from-cookie-async');

module.exports = (http, config) => {
	const ioServerToFront = ioServer(http);

	ioServerToFront.sockets.on('connection', ioServerToFrontSocket => {
		const frontManager = new (require('./helpers/server-streaming-manager'))(ioServerToFront, ioServerToFrontSocket, {});

		const ioClientToApiSocket = ioClient(config.web.apiBaseUrl);

		ioClientToApiSocket.on('connect', () => {
			(async () => {
				const apiManager = new (require('./helpers/client-streaming-manager'))(ioClientToApiSocket);
				const session = await getSessionFromCookieAsync(ioServerToFrontSocket.request.headers.cookie, sessionCookieName, sessionSecret, store);

				/*
				const endpointWhiteList = [
					{method: 'get', path: '/general/timeline'},
					{method: 'get', path: '/applications'},
					{method: 'get', path: '/applications/:id'},
					{method: 'post', path: '/posts/post_status'},
				];

				app.post('/api', checkLogin, (req, res) => {
					(async () => {
						try {
							const method = req.body.method.toLowerCase();
							const endpoint = req.body.endpoint;
							const headers = req.body.headers;
							let body;

							const isPass = endpointWhiteList.find(e => {
								return e.method == method && require('path-to-regexp')(e.path, []).test(endpoint);
							}) != null;

							if (!isPass)
								return res.status(400).json({message: `'${endpoint}' endpoint is not access allowed on '/api'.`});

							if (method == 'post' || method == 'put') {
								body = req.body.body;
							}
							else {
								body = {};
							}

							const mixedHeaders = Object.assign({
								'X-Application-Key': config.web.applicationKey,
								'X-Access-Key': req.session.accessKey
							}, headers);
							const result = await requestApi(method, endpoint, body, mixedHeaders);
							res.status(result.res.statusCode).send(result.body);
						}
						catch(err) {
							res.status(500).send(err);
						}
					})();
				});
				*/
			})();
		});
	});
};
