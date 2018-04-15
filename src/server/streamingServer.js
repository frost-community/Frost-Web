const getSessionFromCookie = require('./helpers/get-session-from-cookie');
const WebSocket = require('websocket');
const WebSocketUtility = require('./helpers/websocket-utility');
const request = require('request-promise');
const requestApi = require('./helpers/request-api');

/**
 * ストリーミング接続をサポートします。
 * セッション経由でAPIにアクセスできる機能が含まれます。
 */
module.exports = (http, sessionStore, debugDetail, config) => {
	const server = new WebSocket.server({ httpServer: http });
	server.on('request', async (wsRequest) => {
		let frontConnection;
		try {
			// セッションを取得
			const session = await getSessionFromCookie(wsRequest.httpRequest.headers['cookie'], config.web.session.name, config.web.session.SecretToken, sessionStore);

			if (session == null || session.accessToken == null) {
				return wsRequest.reject(401, 'Unauthorized');
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
					return wsRequest.reject(500, 'could not connect to api server');
				}
				else {
					console.log('failed to connect api:');
					console.log(err);
					return wsRequest.reject(500, 'an error occurred while connecting to api server');
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
			frontConnection = wsRequest.accept();
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

			// エラー返却メソッド
			frontConnection.error = (eventName, message, addition) => {
				const data = Object.assign({ success: false, message }, addition);
				if (frontConnection.connected) {
					frontConnection.send(eventName, data);
				}
			};

			frontConnection.on('app-create', async (data) => {
				console.log('app-create');

				// recaptcha
				const verifyResult = await request('https://www.google.com/recaptcha/api/siteverify', {
					method: 'POST',
					json: true,
					form: { secret: config.web.reCAPTCHA.secretKey, response: data.recaptchaToken }
				});

				if (!verifyResult.success) {
					frontConnection.error('app-create', 'invalid recaptcha');
					return;
				}

				// request POST /applications
				let result;
				try {
					result = await requestApi('post', '/applications', data, { Authorization: `Bearer ${session.accessToken}` });
				}
				catch (err) {
					const statusCode = err.statusCode ? err.statusCode : 500;
					frontConnection.error('app-create', err.message, { statusCode: statusCode });
					return;
				}

				// response
				frontConnection.send('app-create', { success: true, app: result.application, message: 'app created' });
			});
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
