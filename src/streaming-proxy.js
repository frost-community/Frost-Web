'use strict';

const pathToRegexp = require('path-to-regexp');
const requestAsync = require('request-promise');

const debugDetail = false;

// 利用可能なエンドポイント一覧
const endpointWhiteList = [
	{method: 'get', path: '/general/timeline'},
	{method: 'get', path: '/users/:id'},
	{method: 'post', path: '/applications', before: async (data, frontManager, apiManager, config) => {
		const verifyResult = await requestAsync('https://www.google.com/recaptcha/api/siteverify', {
			method: 'POST',
			json: true,
			form: {secret: config.web.reCAPTCHA.secretKey, response: data.request.body.recaptchaToken}
		});

		if (verifyResult.body.success !== true) {
			frontManager.stream('rest', {success: false, request: data.request, message: 'faild to verify recaptcha'});
		}

		return verifyResult.body.success === true;
	}},
	{method: 'get', path: '/applications'},
	{method: 'get', path: '/applications/:id'},
	{method: 'post', path: '/posts/post_status'},
];

/**
 * ストリーミングREST APIへのリクエストを代理します。
 * これはStreamingServerの一部です。
 */
module.exports = (frontManager, apiManager, config) => {

	// front -> api

	frontManager.on('rest', data => {
		(async () => {
			const {request} = data;
			const {method, endpoint} = request;

			const endpointInfo = endpointWhiteList.find(e => {
				return e.method == method && pathToRegexp(e.path).test(endpoint);
			});

			if (endpointInfo == null) {
				frontManager.stream('rest', {success: false, request: request, message: `'${endpoint}' endpoint is not access allowed on 'rest' event.`});
				return;
			}

			if (debugDetail)
				console.log('[>api] rest');

			// 前処理
			if (endpointInfo.before != null) {
				if (await endpointInfo.before(data, frontManager, apiManager, config) !== true) {
					return;
				}
			}

			apiManager.stream('rest', data);
		})();
	});

	frontManager.on('timeline-connect', data => {
		if (debugDetail)
			console.log('[>api] timeline-connect');
		apiManager.stream('timeline-connect', data);
	});

	frontManager.on('timeline-disconnect', data => {
		if (debugDetail)
			console.log('[>api] timeline-disconnect');
		apiManager.stream('timeline-disconnect', data);
	});

	// front <- api

	const addResponseEvent = (eventName) => {
		apiManager.on(eventName, data => {
			if (debugDetail)
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
};
