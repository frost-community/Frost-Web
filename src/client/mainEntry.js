const riot = require('riot');
const route = require('riot-route').default;
const connectBackendStream = require('./helpers/connect-backend-stream');
const connectApiStream = require('./helpers/connect-api-stream');
const StreamingRest = require('./helpers/streaming-rest');
const loadParams = require('./helpers/load-params');
const waitRecaptcha = require('./helpers/wait-recaptcha');
const loadTags = require('./helpers/load-tags');

const fetchUser = async (streamingRest, userId) => {
	const result = await streamingRest.request('get', `/users/${userId}`);
	if (result.statusCode != 200) {
		throw new Error('failed to fetch user');
	}
	return result.response.user;
};

(async () => {
	const cookie = require('cookie');
	const mixin = loadParams();
	mixin.config = require('../../.configs/client-config.json');
	mixin.getLoginStatus = () => mixin.userId != null;
	mixin.central = riot.observable();

	// when logged in
	if (mixin.getLoginStatus()) {
		var cookies = cookie.parse(document.cookie);
		if (cookies.accessToken != null) {
			localStorage.setItem('accessToken', cookies.accessToken);
			document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
		}

		// backend stream
		mixin.backendStream = await connectBackendStream();

		// api stream
		mixin.apiStream = await connectApiStream(mixin.config, mixin.csrf);
		mixin.streamingRest = new StreamingRest(mixin.apiStream);

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

	route('*', () =>
		changePage('error', { message: 'page not found' }));

	loadTags();

	await waitRecaptcha(mixin.siteKey);

	// mount riot tags
	riot.mixin(mixin);
	riot.mount('*');

	route.start(true);

	// NOTE: move to error page by content of error metaData only when initialization
	if (mixin.error != null) {
		changePage('error');
	}
	// NOTE: move to target page by content of page metadata only when initialization
	else if (mixin.page != null) {
		changePage(mixin.page);
	}

})().catch(err => {
	console.log('何かがおかしいよ');
	console.log(err);
});

require('./styles/page.scss');
