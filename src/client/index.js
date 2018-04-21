const riot = require('riot');
const route = require('riot-route').default;
const WebSocketEvents = require('./helpers/web-socket-events');
const StreamingRest = require('./helpers/streaming-rest');
const fetchJson = require('./helpers/fetch-json');

(async () => {

	const mixin = {};

	// config

	mixin.config = require('../../.configs/client-config.json');

	// csrf

	const csrfElement = document.getElementsByName('frost-csrf').item(0);
	if (csrfElement != null)
		mixin.csrf = csrfElement.content;

	// userId

	const userIdElement = document.getElementsByName('frost-userId').item(0);
	if (userIdElement != null)
		mixin.userId = userIdElement.content;

	mixin.getLoginStatus = () => mixin.userId != null;

	// WebSocket (ログインされている時のみ)

	if (mixin.getLoginStatus()) {
		const secure = location.protocol == 'https:';

		try {
			const accessToken = localStorage.getItem('accessToken');
			const webSocket = await WebSocketEvents.connect(`${secure ? 'wss' : 'ws'}://${mixin.config.apiHost}?access_token=${accessToken}`);
			webSocket.addEventListener('close', (ev) => { console.log('close:', ev); });
			webSocket.addEventListener('error', (ev) => { console.log('error:', ev); });
			WebSocketEvents.init(webSocket);
			mixin.webSocket = webSocket;
		}
		catch (err) {
			alert('WebSocketの接続に失敗しました');
			console.log(err);
			// 念のためログアウト
			await fetchJson('DELETE', '/session', {
				_csrf: mixin.csrf
			});
			return;
		}

		mixin.streamingRest = new StreamingRest(mixin.webSocket);

		try {
			const rest = await mixin.streamingRest.request('get', `/users/${mixin.userId}`);
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

	// central observer

	mixin.central = riot.observable();

	// routings

	const changePage = (pageId, params) => {
		mixin.central.trigger('change-page', pageId, params || {});
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

	const recaptcha = () => new Promise((resolve) => {
		const t = setInterval(() => {
			if (mixin.siteKey == null || typeof grecaptcha != 'undefined') {
				clearInterval(t);
				resolve();
			}
		}, 50);
	});
	await recaptcha();

	// mount

	riot.mixin(mixin);
	riot.mount('frost-container');

	// start routing

	route.start(true);

})().catch(err => {
	console.log('何かがおかしいよ');
	console.log(err);
});
