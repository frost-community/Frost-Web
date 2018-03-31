const getSessionFromCookie = require('./helpers/get-session-from-cookie');
const WebSocket = require('websocket');
const WebSocketUtility = require('./helpers/websocket-utility');
const StreamingProxy = require('./helpers/streaming-proxy');

/**
 * ストリーミング接続をサポートします。
 * セッション経由でAPIにアクセスできる機能が含まれます。
 */
module.exports = (http, sessionStore, debugDetail, config) => {
	const server = new WebSocket.server({ httpServer: http });
	server.on('request', (request) => {
		(async () => {
			let frontConnection;
			try {
				// セッションを取得
				const session = await getSessionFromCookie(request.httpRequest.headers['cookie'], config.web.session.name, config.web.session.SecretToken, sessionStore);

				if (session == null || session.accessKey == null) {
					return request.reject(401, 'Unauthorized');
				}

				// APIに接続
				let apiConnection;
				try {
					if (debugDetail) {
						console.log('[streaming server]', 'connecting streaming api server...');
					}
					const wsUrl = `${config.web.apiBaseUrl}?application_key=${config.web.applicationKey}&access_key=${session.accessKey}`;
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
				const streamingProxy = new StreamingProxy(frontConnection, apiConnection, debugDetail, config);
				streamingProxy.start();
			}
			catch (err) {
				if (frontConnection != null && frontConnection.connected) {
					frontConnection.close();
				}
				console.log('error on: request event in streaming server');
				console.log(err);
			}
		})();
	});

	console.log('[streaming server]', 'initialized');
};
