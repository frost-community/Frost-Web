'use strict';

const prominence = require('prominence');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');

/**
 * Cookieからセッション情報を取得します。
 */
module.exports = async (cookieString, sessionCookieName, cookieSecret, store) => {
	let cookies = cookieParser.signedCookies(cookie.parse(cookieString), cookieSecret);
	return await prominence(store).get(cookies[sessionCookieName]);
};
