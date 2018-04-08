const { promisify } = require('util');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');

/**
 * Cookieからセッション情報を取得します。
 * @param {a} store
 */
module.exports = async (cookieString, sessionCookieName, cookieSecret, store) => {
	if (cookieString == null) {
		return null;
	}

	const getSession = promisify(store.get);

	const cookies = cookieParser.signedCookies(cookie.parse(cookieString), cookieSecret);
	const session = await getSession(cookies[sessionCookieName]);

	return session;
};
