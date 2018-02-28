const riot = require('riot');
const route = require('riot-route').default;
const WebSocketEvents = require('./helpers/web-socket-events');
const StreamingRest = require('./helpers/StreamingRest');

(async () => {

	const mixin = {};

	// userId

	const userIdElement = document.getElementsByName('frost-userId').item(0);
	if (userIdElement != null)
		mixin.userId = userIdElement.content;

	mixin.getLoginStatus = () => mixin.userId != null;

	// WebSocket (ログインされている時のみ)

	if (mixin.getLoginStatus()) {
		const secure = location.protocol == 'https:';

		let webSocket;
		try {
			webSocket = await WebSocketEvents.connectAsync(`${secure ? 'wss' : 'ws'}://${location.host}`);
			webSocket.addEventListener('close', (ev) => { console.log('close:', ev); });
			webSocket.addEventListener('error', (ev) => { console.log('error:', ev); });
			WebSocketEvents.init(webSocket);
			mixin.webSocket = webSocket;
		}
		catch (err) {
			alert('WebSocketの接続に失敗しました');
			console.log(err);
			return;
			// noop
		}

		const streamingRest = new StreamingRest(webSocket);
		try {
			const rest = await streamingRest.requestAsync('get', `/users/${mixin.userId}`);
			mixin.user = rest.response.user;
		}
		catch (err) {
			alert('ユーザー情報の取得に失敗しました');
			console.log(err);
			return;
		}
	}

	// siteKey

	const siteKeyElement = document.getElementsByName('frost-siteKey').item(0);
	if (siteKeyElement != null)
		mixin.siteKey = siteKeyElement.content;

	// csrf

	const csrfElement = document.getElementsByName('frost-csrf').item(0);
	if (csrfElement != null)
		mixin.csrf = csrfElement.content;

	// central observer

	const central = riot.observable();
	mixin.central = central;

	// routings

	const changePage = (pageId, params) => {
		central.trigger('change-page', pageId, params || {});
	};

	route.base('/');

	route('', () =>
		changePage(mixin.getLoginStatus() ? 'home' : 'entrance'));

	route('general', () => {
		if (!mixin.getLoginStatus()) {
			changePage('error', { message: 'forbidden' });
			return;
		}
		changePage('home', { timelineType: 'general' });
	});

	route('dev', () =>
		changePage('dev'));

	route('userlist', () =>
		changePage('userlist'));

	route('users/*', (screenName) =>
		changePage('user', { screenName }));

	route('posts/*', (postId) =>
		changePage('post', { postId }));

	route('*', () =>
		changePage('error', { message: 'page not found' }));

	// loading components

	// - general
	require('./tags/frost-logout-button.tag');
	require('./tags/frost-post-status.tag');
	require('./tags/frost-timeline.tag');
	require('./tags/frost-hint.tag');
	// - container
	require('./tags/frost-container.tag');
	require('./tags/frost-global-nav.tag');
	require('./tags/frost-page-switcher.tag');
	require('./tags/frost-footer.tag');
	// - entrance
	require('./tags/frost-page-entrance.tag');
	require('./tags/frost-form-login.tag');
	require('./tags/frost-form-signup.tag');
	// - home
	require('./tags/frost-page-home.tag');
	require('./tags/frost-home-logo.tag');
	require('./tags/frost-form-create-status.tag');
		// - authorize
		require('./tags/frost-page-appauth.tag');
		require('./tags/frost-form-appauth.tag');
	// - user
	require('./tags/frost-page-user.tag');
	require('./tags/frost-follow-button.tag');
	require('./tags/frost-tabs-user-page.tag');
	// - userlist
	require('./tags/frost-page-userlist.tag');
	// - post
	require('./tags/frost-page-post.tag');
	// - dev
	require('./tags/frost-page-dev.tag');
	require('./tags/frost-applications.tag');
	require('./tags/frost-form-create-application.tag');
	// - error
	require('./tags/frost-page-error.tag');

	// recaptcha

	const recaptchaAsync = () => new Promise((resolve) => {
		const t = setInterval(() => {
			if (mixin.siteKey == null || typeof grecaptcha != 'undefined') {
				clearInterval(t);
				resolve();
			}
		}, 50);
	});
	await recaptchaAsync();

	// mount

	riot.mixin(mixin);
	riot.mount('frost-container');

	// start routing

	route.start(true);

})().catch(err => {
	console.log('何かがおかしいよ');
	console.log(err);
});
