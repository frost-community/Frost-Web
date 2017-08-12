const riot = require('riot');
const route = require('riot-route').default;
const WebSocketEvents = require('./helpers/web-socket-events');

// mixin
const mixinGlobal = {};

(async () => {
	try {
		// userId
		const userIdElement = document.getElementsByName('frost-userId').item(0);
		const userId = userIdElement != null ? userIdElement.content : null;
		mixinGlobal.userId = userId;

		// login status func
		const getLogin = () => userId != null;
		mixinGlobal.getLogin = getLogin;

		// WebSocket (ログインされている時のみ)
		if (getLogin()) {
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

		// loading components

		// - general
		require('./tags/frost-logout-button.tag');
		require('./tags/frost-post-status.tag');
		require('./tags/frost-timeline.tag');
		require('./tags/frost-hint.tag');
		// - app
		require('./tags/frost-app.tag');
		require('./tags/frost-header.tag');
		require('./tags/frost-page-switcher.tag');
		require('./tags/frost-footer.tag');
		// - entrance
		require('./tags/frost-page-entrance.tag');
		require('./tags/frost-login-form.tag');
		require('./tags/frost-signup-form.tag');
		// - home
		require('./tags/frost-page-home.tag');
		require('./tags/frost-home-logo.tag');
		require('./tags/frost-create-status-form.tag');
		// - user
		require('./tags/frost-page-user.tag');
		require('./tags/frost-follow-button.tag');
		// - userlist
		require('./tags/frost-page-userlist.tag');
		// - post
		require('./tags/frost-page-post.tag');
		// - dev
		require('./tags/frost-page-dev.tag');
		require('./tags/frost-applications.tag');
		require('./tags/frost-create-application-form.tag');
		// - error
		require('./tags/frost-page-error.tag');

		// siteKey
		const siteKeyElement = document.getElementsByName('frost-siteKey').item(0);
		const siteKey = siteKeyElement != null ? siteKeyElement.content : null;
		mixinGlobal.siteKey = siteKey;

		// csrf
		const csrfElement = document.getElementsByName('frost-csrf').item(0);
		const csrf = csrfElement != null ? csrfElement.content : null;
		mixinGlobal.csrf = csrf;

		// central observer
		const central = riot.observable();
		mixinGlobal.central = central;

		// routing

		route.base('/');
		route('', () => {
			const pageId = getLogin() ? 'home' : 'entrance';
			central.trigger('change-page', pageId);
			console.log(pageId);
		});
		route('dev', () => {
			const pageId = 'dev';
			central.trigger('change-page', pageId);
			console.log(pageId);
		});
		route('userlist', () => {
			const pageId = 'userlist';
			central.trigger('change-page', pageId);
			console.log(pageId);
		});
		route
		route('*', () => {
			const pageId = 'error';
			central.trigger('change-page', pageId);
			console.log(pageId);
		});

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

	// mount
	riot.mixin(mixinGlobal);
	riot.mount('frost-app');

	// start routing
	route.start(true);

	const hasError = document.getElementsByName('frost-error').item(0) != null;
	if (hasError) {
		mixinGlobal.central.trigger('change-page', 'error');
	}
})();
