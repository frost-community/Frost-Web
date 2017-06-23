'use strict';

const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const prominence = require('prominence');

/**
 * Cookieからセッション情報を取得します。
 */
module.exports = async (cookieString, sessionCookieName, cookieSecret, store) => {
	if (cookieString == null)
		return null;

	let cookies = cookieParser.signedCookies(cookie.parse(cookieString), cookieSecret);
	const session = await prominence(store).get(cookies[sessionCookieName]);

	return session;
};
