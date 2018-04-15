const pathToRegexp = require('path-to-regexp');
const request = require('request-promise');

/**
 * ストリーミングREST APIへのリクエストを代理します。
 */
module.exports = (frontConnection, apiConnection, debugDetail, config) => {
	debugDetail = debugDetail != null ? debugDetail : false;

	const recaptcha = async (data, frontConnection, apiConnection, config) => {
		const verifyResult = await request('https://www.google.com/recaptcha/api/siteverify', {
			method: 'POST',
			json: true,
			form: { secret: config.web.reCAPTCHA.secretKey, response: data.body.recaptchaToken }
		});

		if (!verifyResult.success) {
			frontConnection.send('rest', { success: false, request: data, message: 'invalid recaptcha' });

			throw new Error('invalid recaptcha');
		}
	};

	// プロキシするエンドポイント一覧
	const endpoints = [
		{ method: 'post', path: '/applications', before: recaptcha }
	];

	// front -> api
	frontConnection.on('rest', async (data) => {
		try {
			const { method, endpoint } = data;

			const endpointInfo = endpoints.find(i => i.method == method && pathToRegexp(i.path).test(endpoint));
			if (endpointInfo == null) {
				frontConnection.send('rest', { success: false, request: data, message: `'${endpoint}' endpoint is not access allowed on 'rest' event.` });
				return;
			}

			if (debugDetail) {
				console.log('[>api] rest');
				console.log(data);
			}

			// 前処理
			if (endpointInfo.before != null) {
				await endpointInfo.before(data, frontConnection, apiConnection, config);
			}

			apiConnection.send('rest', data);
		}
		catch (err) {
			console.log('error on: rest event in streaming proxy');
			console.log(err);
		}
	});

	// front <- api
	apiConnection.on('rest', (data) => {
		if (debugDetail)
			console.log('[front<] rest');

		if (frontConnection.connected)
			frontConnection.send('rest', data);
		else
			console.log('connection was disconnected before the result was returned');
	});
};
