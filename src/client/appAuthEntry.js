const riot = require('riot');
const connectApiStream = require('./helpers/connect-api-stream');
const StreamingRest = require('./helpers/streaming-rest');
const loadParams = require('./helpers/load-params');
const waitRecaptcha = require('./helpers/wait-recaptcha');

const loadTags = () => {
	require('./tags/frost-form-appauth.tag');
	require('./tags/frost-form-login.tag');
};

(async () => {
	const cookie = require('cookie');
	const mixin = loadParams();
	mixin.config = require('../../.configs/client-config.json');
	mixin.getLoginStatus = () => mixin.userId != null;

	// when logged in
	if (mixin.getLoginStatus()) {
		var cookies = cookie.parse(document.cookie);
		if (cookies.accessToken != null) {
			localStorage.setItem('accessToken', cookies.accessToken);
			document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
		}

		mixin.webSocket = await connectApiStream(mixin.config, mixin.csrf);
		mixin.streamingRest = new StreamingRest(mixin.webSocket);
	}

	loadTags();

	await waitRecaptcha(mixin.siteKey);

	// mount riot tags
	riot.mixin(mixin);
	riot.mount('*');

})().catch(err => {
	console.log('何かがおかしいよ');
	console.log(err);
});

require('./styles/appAuth.scss');
