const riot = require('riot');
const WebSocketEvents = require('./web-socket-events');

// components
require('../tags/frost-login-form.tag');
require('../tags/frost-signup-form.tag');
require('../tags/frost-logout-button.tag');
require('../tags/frost-create-status-form.tag');
require('../tags/frost-post-status.tag');
require('../tags/frost-public-timeline.tag');
require('../tags/frost-applications.tag');
require('../tags/frost-create-application-form.tag');

(async () => {
	try {
		const obs = riot.observable();

		const webSocket = await WebSocketEvents.connectAsync(`ws://${location.host}`);
		webSocket.addEventListener('close', ev => { console.log('close:'); console.dir(ev); });
		webSocket.addEventListener('error', ev => { console.log('error:'); console.dir(ev); });
		WebSocketEvents.init(webSocket);

		const mixinGlobal = {obs: obs, webSocket: webSocket};
		riot.mixin(mixinGlobal);

		const readyAsync = () => new Promise((resolve, reject) => {
			webSocket.addEventListener('ready', readyEvent => {
				const ready = readyEvent.data;
				const userId = ready.userId;

				if (userId != null)
					mixinGlobal.userId = userId;

				webSocket.sendEvent('rest', {
					request: {
						method: 'get', endpoint: `/users/${userId}`,
						headers: {'x-api-version': 1.0},
					}
				});

				webSocket.addEventListener('rest', restEvent => {
					const rest = restEvent.data;

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
		riot.mount('*');
	}
	catch (err) {
		console.log('何かがおかしいよ');
		console.dir(err);
	}
})();
