'use strict';

const getSessionFromCookieAsync = require('./get-session-from-cookie-async');
const WebSocket = require('websocket');
const WebSocketUtility = require('./websocket-utility');
const StreamingProxy = require('./streaming-proxy');

/**
 * Webクライアントのストリーミング接続をサポートします。
 * セッション経由でAPIにアクセスできる機能が含まれます。
 */

module.exports = (http, sessionStore, debugDetail, config) => {
	const server = new WebSocket.server({httpServer: http});
	server.on('request', request => {
		(async () => {
			let frontConnection;
			try {
				// セッションを取得
				const session = await getSessionFromCookieAsync(request.httpRequest.headers['cookie'], config.web.session.name, config.web.session.SecretToken, sessionStore);

				if (session == null || session.accessKey == null) {
					return request.reject(401, 'Unauthorized');
				}

				// APIに接続
				let apiConnection;
				try {
					if (debugDetail) {
						console.log('connecting streaming api server...');
					}
					const wsUrl = `${config.web.apiBaseUrl}?application_key=${config.web.applicationKey}&access_key=${session.accessKey}`;
					apiConnection = await WebSocketUtility.connectAsync(wsUrl);
					WebSocketUtility.addExtensionMethods(apiConnection);

					if (debugDetail) {
						console.log('connected.');
					}
				}
				catch (err) {
					console.log('failed to connect api:');
					console.dir(err);

					return request.reject(500, 'failed to connect api');
				}

				apiConnection.on('error', err => {
					console.log('api error:', err);
				});

				apiConnection.on('close', data => {
					if (debugDetail) {
						console.log('[api close]:', data.reasonCode, data.description);
					}

					if (frontConnection != null) {
						frontConnection.close();
					}
				});

				// リクエストを受理
				frontConnection = request.accept();
				WebSocketUtility.addExtensionMethods(frontConnection);

				frontConnection.on('error', err => {
					console.log('front error:', err);
				});

				frontConnection.on('close', data => {
					if (debugDetail) {
						console.log('[front close]:', data.reasonCode, data.description);
					}

					apiConnection.close();
				});

				// 認証チェック
				const authorization = await apiConnection.onceAsync('authorization');

				if (authorization.success === false) {
					throw new Error('failure authorization');
				}

				// API代理
				const streamingProxy = new StreamingProxy(frontConnection, apiConnection, debugDetail, config);
				streamingProxy.start();

				const userId = session.accessKey.split('-')[0];
				frontConnection.send('ready', {userId: userId});
				if (debugDetail) {
					console.log('[front<] ready');
				}
			}
			catch(err) {
				if (frontConnection != null) {
					frontConnection.close();
				}
				console.log('error on: request event in streaming server');
				console.dir(err);
			}
		})();
	});
};
