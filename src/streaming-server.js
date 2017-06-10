'use strict';

const getSessionFromCookieAsync = require('./helpers/get-session-from-cookie-async');
const WebSocket = require('websocket');
const WebSocketUtility = require('./helpers/websocket-utility');
const StreamingProxy = require('./helpers/streaming-proxy');

/**
 * Webクライアントのストリーミング接続をサポートします。
 * セッション経由でAPIにアクセスできる機能が含まれます。
 */

module.exports = (http, sessionStore, config) => {
	const server = new WebSocket.server({httpServer: http});
	server.on('request', request => {
		(async () => {
			// セッションを取得
			const session = await getSessionFromCookieAsync(request.httpRequest.headers['cookie'], config.web.session.name, config.web.session.SecretToken, sessionStore);

			if (session == null || session.accessKey == null) {
				request.reject(401, 'Unauthorized');
				return;
			}

			// APIに接続
			let apiConnection;
			try {
				const wsUrl = `${config.web.apiBaseUrl}?application_key=${config.web.applicationKey}&access_key=${session.accessKey}`;
				apiConnection = await WebSocketUtility.connectAsync(wsUrl);
				WebSocketUtility.addExtensionMethods(apiConnection);
			}
			catch (err) {
				console.log('faild to connect api:');
				console.dir(err);

				return request.reject(500, 'faild to connect api');
			}

			apiConnection.on('error', err => {
				console.log('api error:', err);
			});

			apiConnection.on('close', data => {
				console.log('api close:', data.reasonCode, data.description);
			});

			// リクエストを受理
			const frontConnection = request.accept();
			WebSocketUtility.addExtensionMethods(frontConnection);

			frontConnection.on('error', err => {
				console.log('front error:', err);
			});

			frontConnection.on('close', data => {
				console.log('front close:', data.reasonCode, data.description);
			});

			// 認証チェック
			const authorization = await frontConnection.onceAsync('authorization');

			if (authorization.success === false) {
				console.log('failure authorization');
				return;
			}

			// API代理
			const streamingProxy = new StreamingProxy(frontConnection, apiConnection, false, config);
			streamingProxy.start();

			const userId = session.accessKey.split('-')[0];
			frontConnection.send('ready', {userId: userId});
		})();
	});
};
