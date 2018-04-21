const HttpServerError = require('./http-server-error');

// required scopes: auth.host, user.read
module.exports = async (req, streamingRest, config) => {

	// validate user credential
	const validResult = await streamingRest.request('get', '/auth/valid_credential', {
		query: { screenName: req.body.screenName, password: req.body.password }
	});
	if (validResult.statusCode != 200) {
		throw new HttpServerError(validResult.statusCode, `session creation error: ${validResult.response.message}`);
	}
	if (validResult.response.valid !== true) {
		throw new HttpServerError(400, 'session creation error: invalid credential');
	}

	const usersResult = await streamingRest.request('get', '/users', {
		query: {
			'screen_names': req.body.screenName
		}
	});
	const user = usersResult.response.users[0];

	const getToken = async (scopes) => {
		let sessionTokenResult = await streamingRest.request('get', '/auth/tokens', {
			query: {
				applicationId: config.web.applicationId,
				userId: user.id,
				scopes: scopes
			}
		});
		if (sessionTokenResult.statusCode != 200 && sessionTokenResult.statusCode != 404) {
			throw new HttpServerError(sessionTokenResult.statusCode, `session creation error: ${sessionTokenResult.response.message}`);
		}
		if (sessionTokenResult.statusCode == 404) {
			sessionTokenResult = await streamingRest.request('post', '/auth/tokens', {
				body: {
					applicationId: config.web.applicationId,
					userId: user.id,
					scopes: config.web.accessTokenScopes.session
				}
			});
			if (sessionTokenResult.statusCode != 200) {
				throw new HttpServerError(sessionTokenResult.statusCode, `session creation error: ${sessionTokenResult.response.message}`);
			}
		}
		return sessionTokenResult.response.token;
	};

	// get session accessToken
	const sessionToken = await getToken(config.web.accessTokenScopes.session);

	// get client-side sccessToken
	const clientSideToken = await getToken(config.web.accessTokenScopes.clientSide);

	req.session.token = sessionToken;
	req.session.clientSideToken = clientSideToken;
};
