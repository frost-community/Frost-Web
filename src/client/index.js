const riot = require('riot');
const WebSocketEvents = require('./helpers/web-socket-events');

// components

// general
require('./tags/frost-header.tag');
require('./tags/frost-footer.tag');
require('./tags/frost-logout-button.tag');
// entrance
require('./tags/frost-login-form.tag');
require('./tags/frost-signup-form.tag');
// home
require('./tags/frost-home-logo.tag');
require('./tags/frost-create-status-form.tag');
require('./tags/frost-home-timeline.tag');
require('./tags/frost-public-timeline.tag');
require('./tags/frost-post-status.tag');
// dev
require('./tags/frost-applications.tag');
require('./tags/frost-create-application-form.tag');

const mixinGlobal = {};

(async () => {
	try {
		// siteKey
		const siteKeyElement = document.getElementsByName('siteKey').item(0);
		const siteKey = siteKeyElement != null ? siteKeyElement.content : null;
		mixinGlobal.siteKey = siteKey;

		// userId
		const userIdElement = document.getElementsByName('frost-userId').item(0);
		const userId = userIdElement != null ? userIdElement.content : null;
		mixinGlobal.userId = userId;

		// csrf
		const csrfTokenElement = document.getElementsByName('_csrf').item(0);
		const csrfToken = csrfTokenElement != null ? csrfTokenElement.content : null;
		mixinGlobal.csrfToken = csrfToken;

		// observable
		mixinGlobal.obs = riot.observable();

		riot.mount('frost-header, frost-footer');

		const recaptchaAsync = () => new Promise((resolve) => {
			const t = setInterval(() => {
				if (siteKey == null || typeof grecaptcha != 'undefined') {
					clearInterval(t);
					resolve();
				}
			}, 50);
		});

		await recaptchaAsync();

		// WebSocket (ログインされている時のみ)
		if (userId != null) {
			const secure = location.protocol == 'https:';

			let webSocket;
			try {
				webSocket = await WebSocketEvents.connectAsync(`${secure ? 'wss' : 'ws'}://${location.host}`);
				webSocket.addEventListener('close', ev => { console.log('close:'); console.dir(ev); });
				webSocket.addEventListener('error', ev => { console.log('error:'); console.dir(ev); });
				WebSocketEvents.init(webSocket);
				mixinGlobal.webSocket = webSocket;
			}
			catch (err) {
				// noop
			}

			const readyAsync = () => new Promise((resolve, reject) => {
				webSocket.on('ready', ready => {
					webSocket.sendEvent('rest', {
						request: {
							method: 'get', endpoint: `/users/${userId}`,
							headers: {'x-api-version': 1.0},
						}
					});

					webSocket.on('rest', rest => {
						if (rest.request.endpoint == `/users/${userId}`) {
							if (rest.success) {
								if (rest.response.user != null) {
									mixinGlobal.user = rest.response.user;

									return resolve();
								}

								return reject(new Error(`api error: failed to fetch user data. ${rest.response.message}`));
							}

							return reject(new Error(`internal error: failed to fetch user data. ${rest.message}`));
						}
					});
				});
			});

			await readyAsync();
		}
	}
	catch (err) {
		console.log('何かがおかしいよ');
		console.dir(err);
	}

	riot.mixin(mixinGlobal);
	riot.mount('*');
})();
