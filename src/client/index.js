const riot = require('riot');
const route = require('riot-route').default;
const WebSocketEvents = require('./helpers/web-socket-events');
const StreamingRest = require('./helpers/streaming-rest');
const fetchJson = require('./helpers/fetch-json');
const loadTags = require('./helpers/load-tags');

/** サーバから渡されたmetaタグのパラメータを読み込みます */
const loadParams = () => {
	const element = document.getElementsByName('frost-params').item(0);
	return element != null ? JSON.parse(element.content) : {};
};

/** reCAPTCHAが利用可能になるまで待機します */
const waitRecaptcha = (siteKey) => new Promise((resolve) => {
	const t = setInterval(() => {
		if (siteKey == null || typeof grecaptcha != 'undefined') {
			clearInterval(t);
			resolve();
		}
	}, 50);
});

const fetchUser = async (streamingRest, userId) => {
	const result = await streamingRest.request('get', `/users/${userId}`);
	if (result.statusCode != 200) {
		throw new Error('failed to fetch user');
	}
	return result.response.user;
};

(async () => {
	const mixin = loadParams();
	mixin.config = require('../../.configs/client-config.json');
	mixin.getLoginStatus = () => mixin.userId != null;
	mixin.central = riot.observable();

	// when logged in
	if (mixin.getLoginStatus()) {

		// WebSocket
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
			// logout as a precaution
			await fetchJson('DELETE', '/session', {
				_csrf: mixin.csrf
			});
			return;
		}

		// Streaming REST
		mixin.streamingRest = new StreamingRest(mixin.webSocket);

		try {
			mixin.user = await fetchUser(mixin.streamingRest, mixin.userId);
		}
		catch (err) {
			alert('ユーザー情報の取得に失敗しました');
			console.log(err);
			return;
		}
	}

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

	route('oauth/authorize..', () =>
		changePage('appauth'));

	route('*', () =>
		changePage('error', { message: 'page not found' }));

	loadTags();

	await waitRecaptcha(mixin.siteKey);

	// mount riot tags
	riot.mixin(mixin);
	riot.mount('frost-container');

	route.start(true);

	// move to error page by content of error metaData
	if (mixin.error != null) {
		changePage('error', {});
	}

})().catch(err => {
	console.log('何かがおかしいよ');
	console.log(err);
});

require('./styles/page.scss');
