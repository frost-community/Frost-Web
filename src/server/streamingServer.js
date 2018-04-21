const getSessionFromCookie = require('./helpers/get-session-from-cookie');
const WebSocket = require('websocket');
const WebSocketUtility = require('./helpers/websocket-utility');
const events = require('websocket-events');
const request = require('request-promise');
const StreamingRest = require('./helpers/streaming-rest');

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
			const session = await getSessionFromCookie(wsRequest.httpRequest.headers['cookie'], config.session.name, config.session.SecretToken, sessionStore);

			if (session == null || session.token == null) {
				return wsRequest.reject(401, 'Unauthorized');
			}

			// APIに接続
			let apiConnection;
			try {
				if (debugDetail) {
					console.log('[streaming server]', 'connecting streaming api server...');
				}
				apiConnection = await WebSocketUtility.connect(`ws://${config.apiHost}?access_token=${session.token.accessToken}`);
				events(apiConnection);
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

			apiConnection.on('error', err => {
				if (err.indexOf('ECONNRESET') != -1) {
					return;
				}
				console.log('api error:', err);
			});

			apiConnection.on('close', data => {
				if (debugDetail) {
					console.log('[api close]:', data.reasonCode, data.description);
				}

				if (frontConnection != null && frontConnection.connected) {
					frontConnection.close();
				}
			});

			const streamingRest = new StreamingRest(apiConnection);

			// リクエストを受理
			frontConnection = wsRequest.accept();
			events(frontConnection);

			frontConnection.on('error', err => {
				if (err.message.indexOf('ECONNRESET') != -1) {
					return;
				}

				console.log('front error:', err);
			});

			frontConnection.on('close', data => {
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
				try {
					console.log('app-create');
					// recaptcha
					const verifyResult = await request('https://www.google.com/recaptcha/api/siteverify', {
						method: 'POST',
						json: true,
						form: { secret: config.reCAPTCHA.secretKey, response: data.recaptchaToken }
					});
					if (!verifyResult.success) {
						frontConnection.error('app-create', 'invalid recaptcha');
						return;
					}

					// request POST /applications
					const result = await streamingRest.request('post', '/applications', { body: data.body });
					if (result.statusCode != 200) {
						frontConnection.error('app-create', result.response.message, { statusCode: result.statusCode });
						return;
					}

					// response
					frontConnection.send('app-create', { success: true, app: result.response.application, message: 'app created' });
				}
				catch (err) {
					const detail = {};
					if (err.statusCode) {
						detail.statusCode = err.statusCode;
					}
					frontConnection.error('app-create', err.message, detail);
					console.log(err);
					return;
				}
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
