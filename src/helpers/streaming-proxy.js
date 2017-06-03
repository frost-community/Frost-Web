'use strict';

const pathToRegexp = require('path-to-regexp');
const requestAsync = require('request-promise');

/**
 * ストリーミングREST APIへのリクエストを代理します。
 */
class StreamingProxy {
	constructor(frontManager, apiManager, debugDetail, config) {
		// 利用可能なエンドポイント一覧
		this.endpointWhiteList = [
			{method: 'get', path: '/general/timeline'},
			{method: 'get', path: '/users/:id'},
			{method: 'post', path: '/applications', before: async (data, frontManager, apiManager, config) => {
				const verifyResult = await requestAsync('https://www.google.com/recaptcha/api/siteverify', {
					method: 'POST',
					json: true,
					form: {secret: config.web.reCAPTCHA.secretKey, response: data.request.body.recaptchaToken}
				});

				if (verifyResult.success !== true) {
					frontManager.stream('rest', {success: false, request: data.request, message: 'faild to verify recaptcha'});
				}

				return verifyResult.success === true;
			}},
			{method: 'get', path: '/applications'},
			{method: 'get', path: '/applications/:id'},
			{method: 'post', path: '/posts/post_status'},
		];

		// クライアントに返却する必要のあるイベント一覧
		this.needReturnEventNames = [
			'authorization',
			'rest',
			'timeline-connect',
			'timeline-disconnect',
			'data:public:status',
			'data:home:status'
		];

		this.frontManager = frontManager;
		this.apiManager = apiManager;
		this.debugDetail = debugDetail != null ? debugDetail : false;
		this.config = config;
	}

	/**
	 * クライアントに返却する必要のあるイベントを追加します。
	 */
	addNeedReturnEvent (eventName) {
		this.apiManager.on(eventName, data => {
			if (this.debugDetail)
				console.log(`[front<] ${eventName}`);
			this.frontManager.stream(eventName, data);
		});
	}

	/**
	 * 開始します。
	 */
	start() {

		// front -> api

		this.frontManager.on('rest', data => {
			(async () => {
				const {request} = data;
				const {method, endpoint} = request;

				const endpointInfo = this.endpointWhiteList.find(e => {
					return e.method == method && pathToRegexp(e.path).test(endpoint);
				});

				if (endpointInfo == null) {
					this.frontManager.stream('rest', {success: false, request: request, message: `'${endpoint}' endpoint is not access allowed on 'rest' event.`});
					return;
				}

				if (this.debugDetail)
					console.log('[>api] rest');

				// 前処理
				if (endpointInfo.before != null) {
					if (await endpointInfo.before(data, this.frontManager, this.apiManager, this.config) !== true) {
						return;
					}
				}

				this.apiManager.stream('rest', data);
			})();
		});

		this.frontManager.on('timeline-connect', data => {
			if (this.debugDetail)
				console.log('[>api] timeline-connect');
			this.apiManager.stream('timeline-connect', data);
		});

		this.frontManager.on('timeline-disconnect', data => {
			if (this.debugDetail)
				console.log('[>api] timeline-disconnect');
			this.apiManager.stream('timeline-disconnect', data);
		});

		// front <- api

		for (const eventName of this.needReturnEventNames) {
			this.addNeedReturnEvent(eventName);
		}
	}
}

module.exports = StreamingProxy;
