const ioServer = require('socket.io');
const ioClient = require('socket.io-client');
const getSessionFromCookieAsync = require('./helpers/get-session-from-cookie-async');

const sessionCookieName = 'connect.sid';

module.exports = (http, sessionStore, config) => {
	const ioServerToFront = ioServer(http);

	ioServerToFront.sockets.on('connection', ioServerToFrontSocket => {
		(async () => {
			const frontManager = new (require('./helpers/server-streaming-manager'))(ioServerToFront, ioServerToFrontSocket, {});
			const session = await getSessionFromCookieAsync(ioServerToFrontSocket.request.headers.cookie, sessionCookieName, config.web.session.SecretToken, sessionStore);

			if (!session.accessKey) {
				frontManager.stream('error', {message: 'unauthorized'});
				return;
			}

			const ioClientToApiSocket = ioClient(config.web.apiBaseUrl, {query: {
				applicationKey: config.web.applicationKey,
				accessKey: session.accessKey
			}});

			ioClientToApiSocket.on('connect', () => {
				const apiManager = new (require('./helpers/client-streaming-manager'))(ioClientToApiSocket);

				const endpointWhiteList = [
					{method: 'get', path: '/general/timeline'},
					{method: 'get', path: '/applications'},
					{method: 'get', path: '/applications/:id'},
					{method: 'post', path: '/posts/post_status'},
				];

				frontManager.on('rest', data => {
					const method = data.request.method;
					const endpoint = data.request.endpoint;

					const isPass = endpointWhiteList.find(e => {
						return e.method == method && require('path-to-regexp')(e.path, []).test(endpoint);
					}) != null;

					if (!isPass) {
						frontManager.stream('error', {message: `'${endpoint}' endpoint is not access allowed on 'rest' event.`});
						return;
					}

					apiManager.stream('rest', data);
					frontManager.stream('success', {message: 'successful rest request'});
				});

				frontManager.on('timeline-connect', data => {
					const timelineType = data.type;
					if (timelineType == null) {
						return frontManager.error({message: '\'type\' parameter is require'});
					}

					apiManager.stream('timeline-connect', data);
				});

				frontManager.on('timeline-disconnect', data => {
					const timelineType = data.type;
					if (timelineType == null) {
						return frontManager.error({message: '\'type\' parameter is require'});
					}

					apiManager.stream('timeline-disconnect', data);
				});

				const addResponseEvent = (eventName) => {
					apiManager.on(eventName, data => {
						frontManager.stream(eventName, data);
					});
				};

				const eventNames = [
					'success',
					'error',
					'rest',
					'data:public:status',
					'data:home:status'
				];

				for (const eventName of eventNames) {
					addResponseEvent(eventName);
				}

				frontManager.stream('ready', {});
			});
		})();
	});
};
