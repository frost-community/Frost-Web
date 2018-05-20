const HttpServerError = require('./http-server-error');

/**
 * validate user credential
 *
 * required scopes: `auth.host`, `user.read`
*/
module.exports = async (screenName, password, streamingRest) => {
	const validResult = await streamingRest.request('get', '/auth/valid_credential', {
		query: { screenName, password }
	});
	if (validResult.statusCode != 200) {
		throw new HttpServerError(500, `${validResult.statusCode} - ${validResult.response.message}`);
	}
	if (validResult.response.valid !== true) {
		throw new HttpServerError(400, 'invalid credential');
	}

	const usersResult = await streamingRest.request('get', '/users', {
		query: {
			'screen_names': screenName
		}
	});
	const user = usersResult.response.users[0];

	return user;
};
