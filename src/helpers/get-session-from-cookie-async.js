const cookie = require('cookie');
const cookieParser = require('cookie-parser');

module.exports = (cookieString, sessionCookieName, cookieSecret, store) => new Promise((resolve, reject) => {
	let cookies = cookieParser.signedCookies(cookie.parse(cookieString), cookieSecret);
	store.get(cookies[sessionCookieName], (err, session) => {
		if (err)
			return reject(err);

		resolve(session);
	});
});
