const getSessionFromCookie = require('./helpers/get-session-from-cookie');
const WebSocket = require('websocket');
const WebSocketUtility = require('./helpers/websocket-utility');
const streamingProxy = require('./helpers/streaming-proxy');

/**
 * ストリーミング接続をサポートします。
 * セッション経由でAPIにアクセスできる機能が含まれます。
 */
module.exports = (http, sessionStore, debugDetail, config) => {
	const server = new WebSocket.server({ httpServer: http });
	server.on('request', async (request) => {
		let frontConnection;
		try {
			// セッションを取得
			const session = await getSessionFromCookie(request.httpRequest.headers['cookie'], config.web.session.name, config.web.session.SecretToken, sessionStore);

			if (session == null || session.accessToken == null) {
				return request.reject(401, 'Unauthorized');
			}

			// APIに接続
			let apiConnection;
			try {
				if (debugDetail) {
					console.log('[streaming server]', 'connecting streaming api server...');
				}
				const wsUrl = `${config.web.apiBaseUrl}?access_token=${session.accessToken}`;
				apiConnection = await WebSocketUtility.connect(wsUrl);
				WebSocketUtility.addExtensionMethods(apiConnection);

				if (debugDetail) {
					console.log('[streaming server]', 'connected streaming api server');
				}
			}
			catch (err) {
				if (err.message.indexOf('ECONNREFUSED') != -1) {
					console.log('error: could not connect to api server');
					return request.reject(500, 'could not connect to api server');
				}
				else {
					console.log('failed to connect api:');
					console.log(err);
					return request.reject(500, 'an error occurred while connecting to api server');
				}
			}

			apiConnection.on('error', (err) => {
				console.log('api error:', err);
			});

			apiConnection.on('close', (data) => {
				if (debugDetail) {
					console.log('[api close]:', data.reasonCode, data.description);
				}

				if (frontConnection != null && frontConnection.connected) {
					frontConnection.close();
				}
			});

			// リクエストを受理
			frontConnection = request.accept();
			WebSocketUtility.addExtensionMethods(frontConnection);

			frontConnection.on('error', (err) => {
				if (err.message.indexOf('ECONNRESET') != -1) {
					// noop
				}
				else {
					console.log('front error:', err);
				}
			});

			frontConnection.on('close', (data) => {
				if (debugDetail) {
					console.log('[front close]:', data.reasonCode, data.description);
				}

				if (apiConnection.connected) {
					apiConnection.close();
				}
			});

			// API代理
			streamingProxy(frontConnection, apiConnection, debugDetail, config);
		}
		catch (err) {
			if (frontConnection != null && frontConnection.connected) {
				frontConnection.close();
			}
			console.log('error on: request event in streaming server');
			console.log(err);
		}
	});

	console.log('[streaming server]', 'initialized');
};
