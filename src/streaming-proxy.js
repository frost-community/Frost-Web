'use strict';

const ioServer = require('socket.io');
const ioClient = require('socket.io-client');
const pathToRegexp = require('path-to-regexp');
const getSessionFromCookieAsync = require('./helpers/get-session-from-cookie-async');
const ClientStreamingManager = require('./helpers/client-streaming-manager');
const ServerStreamingManager = require('./helpers/server-streaming-manager');

const endpointWhiteList = [
	{method: 'get', path: '/general/timeline'},
	{method: 'get', path: '/users/:id'},
	// {method: 'post', path: '/applications'}, // TODO: recaptchaTokenの受け取りに対応
	{method: 'get', path: '/applications'},
	{method: 'get', path: '/applications/:id'},
	{method: 'post', path: '/posts/post_status'},
];

module.exports = (http, sessionStore, config) => {
	const ioServerToFront = ioServer(http);

	ioServerToFront.sockets.on('connection', ioServerToFrontSocket => {
		(async () => {
			const frontManager = new ServerStreamingManager(ioServerToFront, ioServerToFrontSocket);
			const session = await getSessionFromCookieAsync(ioServerToFrontSocket.request.headers.cookie, config.web.session.name, config.web.session.SecretToken, sessionStore);

			const apiManager = new ClientStreamingManager(ioClient(config.web.apiBaseUrl, {
				query: {
					applicationKey: config.web.applicationKey,
					accessKey: session.accessKey
				}
			}));

			// 接続されるまで待機
			await apiManager.waitConnectAsync();

			apiManager.onDisconnect(() => {
				frontManager.disconnect();
				console.log('front disconnect');
			});

			// 認証チェック
			if ((await apiManager.waitEventAsync('authorization')).success === false) {
				console.log('failure authorization');
				return;
			}

			// front -> web -> api

			frontManager.on('rest', data => {
				const method = data.request.method;
				const endpoint = data.request.endpoint;

				const isPass = endpointWhiteList.find(e => {
					return e.method == method && pathToRegexp(e.path).test(endpoint);
				}) != null;

				if (!isPass) {
					frontManager.stream('rest', {success: false, request: data.request, message: `'${endpoint}' endpoint is not access allowed on 'rest' event.`});
					return;
				}

				console.log('[>api] rest');
				apiManager.stream('rest', data);
			});

			frontManager.on('timeline-connect', data => {
				console.log('[>api] timeline-connect');
				apiManager.stream('timeline-connect', data);
			});

			frontManager.on('timeline-disconnect', data => {
				console.log('[>api] timeline-disconnect');
				apiManager.stream('timeline-disconnect', data);
			});

			// front <- web <- api

			const addResponseEvent = (eventName) => {
				apiManager.on(eventName, data => {
					console.log(`[front<] ${eventName}`);
					frontManager.stream(eventName, data);
				});
			};

			const eventNames = [
				'authorization',
				'rest',
				'timeline-connect',
				'timeline-disconnect',
				'data:public:status',
				'data:home:status'
			];

			for (const eventName of eventNames) {
				addResponseEvent(eventName);
			}

			const userId = session.accessKey.split('-')[0];

			frontManager.stream('ready', {userId: userId});
		})();
	});
};
