'use strict';

const pathToRegexp = require('path-to-regexp');
const requestAsync = require('request-promise');

/**
 * ストリーミングREST APIへのリクエストを代理します。
 */
class StreamingProxy {
	constructor(frontConnection, apiConnection, debugDetail, config) {
		// 利用可能なエンドポイント一覧
		this.endpointWhiteList = [
			{ method: 'get', path: '/general/timeline' },
			{ method: 'get', path: '/users' },
			{ method: 'get', path: '/users/:id' },
			{ method: 'get', path: '/users/:id/followings/:target_id' },
			{ method: 'put', path: '/users/:id/followings/:target_id' },
			{ method: 'delete', path: '/users/:id/followings/:target_id' },
			{ method: 'get', path: '/users/:id/timelines/home' },
			{ method: 'get', path: '/users/:id/timelines/user' },
			{
				method: 'post', path: '/applications',
				before: async (data, frontConnection, apiConnection, config) => {
					const verifyResult = await requestAsync('https://www.google.com/recaptcha/api/siteverify', {
						method: 'POST',
						json: true,
						form: { secret: config.web.reCAPTCHA.secretKey, response: data.request.body.recaptchaToken }
					});

					if (verifyResult.success !== true) {
						frontConnection.send('rest', { success: false, request: data.request, message: 'failed to verify recaptcha' });

						throw new Error('failed to verify recaptcha');
					}
				}
			},
			{ method: 'get', path: '/applications' },
			{ method: 'get', path: '/applications/:id' },
			{ method: 'post', path: '/posts/post_status' },
		];

		// クライアントに返却する必要のあるイベント一覧
		this.needReturnEventNames = [
			'rest',
			'timeline-connect',
			'timeline-disconnect',
			'stream:general-timeline-status',
			'stream:home-timeline-status'
		];

		this.frontConnection = frontConnection;
		this.apiConnection = apiConnection;
		this.debugDetail = debugDetail != null ? debugDetail : false;
		this.config = config;
	}

	/**
	 * クライアントに返却する必要のあるイベントを追加します。
	 */
	addNeedReturnEvent(eventName) {
		this.apiConnection.on(eventName, (data) => {
			if (this.debugDetail) {
				console.log(`[front<] ${eventName}`);
			}

			if (this.frontConnection.connected) {
				this.frontConnection.send(eventName, data);
			}
			else {
				console.log('connection was disconnected before the result was returned');
			}
		});
	}

	/**
	 * 開始します。
	 */
	start() {

		// front -> api

		this.frontConnection.on('rest', (data) => {
			(async () => {
				try {
					const { method, endpoint } = data;

					const endpointInfo = this.endpointWhiteList.find((item) => {
						return item.method == method && pathToRegexp(item.path).test(endpoint);
					});

					if (endpointInfo == null) {
						this.frontConnection.send('rest', { success: false, request: data, message: `'${endpoint}' endpoint is not access allowed on 'rest' event.` });
						return;
					}

					if (this.debugDetail) {
						console.log('[>api] rest');
						console.dir(data);
						console.log('----');
					}

					// 前処理
					if (endpointInfo.before != null) {
						try {
							await endpointInfo.before(data, this.frontConnection, this.apiConnection, this.config);
						}
						catch (err) {
							console.dir(err);
							return;
						}
					}

					this.apiConnection.send('rest', data);
				}
				catch (err) {
					console.log('error on: rest event in streaming proxy');
					console.dir(err);
				}
			})();
		});

		this.frontConnection.on('timeline-connect', (data) => {
			if (this.debugDetail) {
				console.log('[>api] timeline-connect');
			}

			this.apiConnection.send('timeline-connect', data);
		});

		this.frontConnection.on('timeline-disconnect', (data) => {
			if (this.debugDetail) {
				console.log('[>api] timeline-disconnect');
			}

			this.apiConnection.send('timeline-disconnect', data);
		});

		// front <- api

		for (const eventName of this.needReturnEventNames) {
			this.addNeedReturnEvent(eventName);
		}
	}
}

module.exports = StreamingProxy;
