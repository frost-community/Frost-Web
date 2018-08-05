const cookie = require('cookie');
const cookieParser = require('cookie-parser');

/** Cookieからセッション情報を取得します。*/
module.exports = async (cookieString, sessionCookieName, cookieSecret, store) => {
	if (cookieString == null) {
		return null;
	}

	const getSession = (store, sid) => new Promise((resolve, reject) => {
		store.get(sid, (err, result) => {
			if (err) return reject(err);
			resolve(result);
		});
	});

	const cookies = cookieParser.signedCookies(cookie.parse(cookieString), cookieSecret);
	const session = await getSession(store, cookies[sessionCookieName]);

	return session;
};
