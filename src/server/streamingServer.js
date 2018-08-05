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
module.exports = (http, sessionStore, hostStreamingRest, config) => {
	const log = (...args) => {
		console.log('[streaming server]', ...args);
	};
	const debugLog = (...args) => {
		if (config.debug) {
			log(...args);
		}
	};

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
			let sessionApiConnection;
			try {
				debugLog('connecting streaming api server...');
				sessionApiConnection = await WebSocketUtility.connect(`ws://${config.apiHost}?access_token=${session.token.accessToken}`);
				events(sessionApiConnection);
			}
			catch (err) {
				if (err.message.indexOf('ECONNREFUSED') != -1) {
					log('error: could not connect to api server');
					return wsRequest.reject(500, 'could not connect to api server');
				}
				else {
					log('failed to connect api:', err);
					return wsRequest.reject(500, 'an error occurred while connecting to api server');
				}
			}

			sessionApiConnection.on('error', err => {
				if (err.indexOf('ECONNRESET') != -1) {
					return;
				}
				log('api error:', err);
			});

			sessionApiConnection.on('close', data => {
				debugLog('api close:', data.reasonCode, data.description);

				if (frontConnection != null && frontConnection.connected) {
					frontConnection.close();
				}
			});

			const sessionStreamingRest = new StreamingRest(sessionApiConnection);

			// リクエストを受理
			frontConnection = wsRequest.accept();
			events(frontConnection);

			frontConnection.on('error', err => {
				if (err.message.indexOf('ECONNRESET') != -1) {
					return;
				}

				log('front error:', err);
			});

			frontConnection.on('close', data => {
				debugLog('front close:', data.reasonCode, data.description);

				if (sessionApiConnection.connected) {
					sessionApiConnection.close();
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
					log('app-create');
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
					const result = await sessionStreamingRest.request('post', '/applications', { body: data.body });
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
					log('app-create error:', err);
					return;
				}
			});

			frontConnection.on('app-secret-get', async (data) => {
				try {
					log('app-secret-get');

					// request GET /applications/:id
					const appResult = await sessionStreamingRest.request('get', `/applications/${data.appId}`);
					if (appResult.statusCode != 200) {
						frontConnection.error('app-secret-get', appResult.response.message, { statusCode: appResult.statusCode });
						return;
					}

					// own app?
					if (session.token.userId != appResult.response.application.creatorId) {
						frontConnection.error('app-secret-get', 'you do not have this application');
						return;
					}

					let secret;
					// request GET /applications/:id/secret
					const result = await hostStreamingRest.request('get', `/applications/${data.appId}/secret`);
					if (result.statusCode != 200 && result.statusCode != 404) {
						frontConnection.error('app-secret-get', result.response.message, { statusCode: result.statusCode });
						return;
					}

					if (result.statusCode == 200) {
						secret = result.response.secret;
					}
					else {
						// generate secret
						const result2 = await hostStreamingRest.request('post', `/applications/${data.appId}/secret`);
						if (result2.statusCode != 200) {
							log('generate secret error(api response):', result2.statusCode, result2.response.message);
							frontConnection.error('app-secret-get', result.response.message, { statusCode: result.statusCode });
							return;
						}

						secret = result2.response.secret;
					}

					// response
					frontConnection.send('app-secret-get', { success: true, secret: secret });
				}
				catch (err) {
					const detail = {};
					if (err.statusCode) {
						detail.statusCode = err.statusCode;
					}
					frontConnection.error('app-secret-get', err.message, detail);
					log('app-secret-get error:', err);
					return;
				}
			});

			debugLog('connected');
		}
		catch (err) {
			if (frontConnection != null && frontConnection.connected) {
				frontConnection.close();
			}
			log('error:', err);
		}
	});

	log('initialized');
};
