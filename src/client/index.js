const riot = require('riot');
const route = require('riot-route').default;
const WebSocketEvents = require('./helpers/web-socket-events');

// components

require('./tags/frost-page-selector.tag');
require('./tags/frost-page-dev.tag');
require('./tags/frost-page-entrance.tag');
require('./tags/frost-page-error.tag');
require('./tags/frost-page-home.tag');
require('./tags/frost-page-post.tag');
require('./tags/frost-page-user.tag');
require('./tags/frost-page-userlist.tag');

// general
require('./tags/frost-header.tag');
require('./tags/frost-footer.tag');
require('./tags/frost-logout-button.tag');
require('./tags/frost-post-status.tag');
require('./tags/frost-timeline.tag');
require('./tags/frost-hint.tag');
// entrance
require('./tags/frost-login-form.tag');
require('./tags/frost-signup-form.tag');
// home
require('./tags/frost-home-logo.tag');
require('./tags/frost-create-status-form.tag');
// user
require('./tags/frost-follow-button.tag');
// dev
require('./tags/frost-applications.tag');
require('./tags/frost-create-application-form.tag');

const mixinGlobal = {};

(async () => {
	try {
		// userId
		const userIdElement = document.getElementsByName('frost-userId').item(0);
		const userId = userIdElement != null ? userIdElement.content : null;
		mixinGlobal.userId = userId;

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
					webSocket.on('rest', rest => {
						if (rest.request.endpoint == `/users/${userId}`) {
							if (rest.success) {
								if (rest.response.user != null) {
									mixinGlobal.user = rest.response.user;

									return resolve();
								}

								return reject(new Error(`api error: failed to fetch user data. ${rest.response.message}`));
							}

							return reject(new Error(`internal error: failed to fetch user data. ${rest.response.message}`));
						}
					});

					webSocket.sendEvent('rest', {
						request: {
							method: 'get', endpoint: `/users/${userId}`,
							headers: {'x-api-version': 1.0},
						}
					});
				});
			});

			await readyAsync();
		}

		// siteKey
		const siteKeyElement = document.getElementsByName('siteKey').item(0);
		const siteKey = siteKeyElement != null ? siteKeyElement.content : null;
		mixinGlobal.siteKey = siteKey;

		// csrf
		const csrfTokenElement = document.getElementsByName('_csrf').item(0);
		const csrfToken = csrfTokenElement != null ? csrfTokenElement.content : null;
		mixinGlobal.csrfToken = csrfToken;

		// central observer
		mixinGlobal.central = riot.observable();

		// routing

		route.base('/');
		route('', () => {
			console.log('entrance/home');

		});
		route('dev', () => {
			console.log('dev');
		});
		route('userlist', () => {
			console.log('userlist');
		});

		route.start(true);

		// recaptcha

		const recaptchaAsync = () => new Promise((resolve) => {
			const t = setInterval(() => {
				if (siteKey == null || typeof grecaptcha != 'undefined') {
					clearInterval(t);
					resolve();
				}
			}, 50);
		});

		await recaptchaAsync();
	}
	catch (err) {
		console.log('何かがおかしいよ');
		console.dir(err);
	}

	riot.mixin(mixinGlobal);
	riot.mount('*');
})();
