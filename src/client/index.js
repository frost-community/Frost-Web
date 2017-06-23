const riot = require('riot');
const WebSocketEvents = require('./helpers/web-socket-events');

// components
require('./tags/frost-login-form.tag');
require('./tags/frost-signup-form.tag');
require('./tags/frost-logout-button.tag');
require('./tags/frost-create-status-form.tag');
require('./tags/frost-post-status.tag');
require('./tags/frost-public-timeline.tag');
require('./tags/frost-applications.tag');
require('./tags/frost-create-application-form.tag');

const mixinGlobal = {};

(async () => {
	try {
		const secure = location.protocol == 'https:';

		// WebSocket
		const webSocket = await WebSocketEvents.connectAsync(`${secure ? 'wss' : 'ws'}://${location.host}`);
		webSocket.addEventListener('close', ev => { console.log('close:'); console.dir(ev); });
		webSocket.addEventListener('error', ev => { console.log('error:'); console.dir(ev); });
		WebSocketEvents.init(webSocket);
		mixinGlobal.webSocket = webSocket;

		// observable
		mixinGlobal.obs = riot.observable();

		// others
		const siteKeyElement = document.getElementsByName('siteKey').item(0);
		const csrfElement = document.getElementsByName('_csrf').item(0);
		if (siteKeyElement != null) {
			mixinGlobal.siteKey = siteKeyElement.content;
		}

		if (csrfElement != null) {
			mixinGlobal.csrfToken = csrfElement.content;
		}

		const readyAsync = () => new Promise((resolve, reject) => {
			webSocket.on('ready', ready => {
				const userId = ready.userId;

				if (userId != null) {
					mixinGlobal.userId = userId;
				}

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

							return reject(new Error(`api error: faild to fetch user data. ${rest.response.message}`));
						}

						return reject(new Error(`internal error: faild to fetch user data. ${rest.message}`));
					}
				});
			});
		});

		await readyAsync();
	}
	catch (err) {
		console.log('何かがおかしいよ');
		console.dir(err);
	}

	riot.mixin(mixinGlobal);
	riot.mount('*');
})();
