const bodyParser = require('body-parser');
const checkLogin = require('./helpers/check-login');
const compression = require('compression');
const connectRedis = require('connect-redis');
const createSession = require('./helpers/create-session');
const csurf = require('csurf');
const express = require('express');
const expressSession = require('express-session');
const helmet = require('helmet');
const HttpServerError = require('./helpers/http-server-error');
const isSmartPhone = require('./helpers/is-smart-phone');
const path = require('path');
const request = require('request-promise');
const StreamingRest = require('./helpers/streaming-rest');
const OAuthServer = require('./helpers/oauth-server');
const getType = require('./helpers/get-type');
const passport = require('passport');
const { Strategy : LocalStrategy } = require('passport-local');

/**
 * クライアントサイドにWebページと各種操作を提供します
 */
module.exports = async (db, hostApiConnection, isDebug, config) => {
	const log = (...args) => {
		console.log('[http server]', ...args);
	};
	const debugLog = (...args) => {
		if (isDebug) {
			log(...args);
		}
	};

	const streamingRest = new StreamingRest(hostApiConnection);

	// == OAuth2 Server ==

	const oAuthServer = new OAuthServer(db, streamingRest);
	oAuthServer.build();
	oAuthServer.defineStrategies();

	// == passport ==

	// 通常のログイン認証向け
	passport.use('login', new LocalStrategy({ usernameField: 'screenName' }, async (screenName, password, done) => {
		try {
			// validate user credential
			const validResult = await streamingRest.request('get', '/auth/valid_credential', {
				query: { screenName: screenName, password: password }
			});
			if (validResult.statusCode != 200) {
				throw new Error(validResult.response.message);
			}
			if (validResult.response.valid !== true) {
				return done(null, false);
			}

			const usersResult = await streamingRest.request('get', '/users', {
				query: {
					'screen_names': screenName
				}
			});
			const user = usersResult.response.users[0];

			done(null, user);
		}
		catch (err) {
			done(err);
		}
	}));

	// セッションとユーザー情報を関連付けるために必要
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	passport.deserializeUser(async (id, done) => {
		try {
			const userResult = await streamingRest.request('get', `/users/${id}`);
			if (userResult.statusCode != 200) {
				throw new HttpServerError(userResult.statusCode, userResult.response.message);
			}

			done(null, userResult.response.user);
		}
		catch (err) {
			done(err);
		}
	});

	// == express settings ==

	const app = express();
	const sessionStore = new (connectRedis(expressSession))({});

	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'pug');

	// == Middlewares ==

	// body parser

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	// compression

	app.use(compression({
		threshold: 0,
		level: 9,
		memLevel: 9
	}));

	// session

	app.use(expressSession({
		store: sessionStore,
		name: config.session.name,
		secret: config.session.SecretToken,
		cookie: {
			httpOnly: false,
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7days
		},
		resave: true,
		saveUninitialized: true,
		rolling: true
	}));

	// passport

	app.use(passport.initialize());
	app.use(passport.session());

	// securities

	app.use(helmet({ frameguard: { action: 'deny' } }));
	app.use(csurf());

	// page middleware

	app.use((req, res, next) => {
		try {
			req.isSmartPhone = isSmartPhone(req.header('User-Agent'));

			res.renderPage = (pageParams, renderParams) => {
				pageParams = Object.assign(pageParams || {}, {
					csrf: req.csrfToken(),
					isSmartPhone: req.isSmartPhone,
					siteKey: config.reCAPTCHA.siteKey
				});

				// memo: クライアントサイドでは、パラメータ中にuserIdが存在するかどうかでWebSocketへの接続が必要かどうかを判断します。このコードはそのために必要です。
				if (req.session.token != null) {
					pageParams.userId = req.session.token.userId;
				}

				let pageRenderParams = {
					scriptFile: '/main.js',
					params: pageParams
				};
				pageRenderParams = Object.assign(pageRenderParams, renderParams);

				res.render('page', pageRenderParams);
			};

			debugLog('req:', req.method, req.path);

			next();
		}
		catch (err) {
			throw new HttpServerError(500, err.message, true);
		}
	});

	// static files

	app.use(express.static(path.join(__dirname, '../client.built'), { etag: false }));

	// == routings ==

	// oauth2

	app.get('/oauth/authorize', oAuthServer.authorizeMiddle(), (req, res) => {
		res.renderPage({ transactionId: req.oauth2.transactionID });
	});
	app.post('/oauth/authorize', oAuthServer.decisionMiddle());
	app.post('/oauth/token', oAuthServer.tokenMiddle());

	// session

	app.route('/session')
		.put(passport.authenticate('login', { failureMessage: 'failed login', failWithError: true }),
			async (req, res, next) => {
				try {
					if (req.session.token == null) {
						const getToken = async (scopes) => {
							let tokenResult = await streamingRest.request('get', '/auth/tokens', {
								query: {
									applicationId: config.applicationId,
									userId: req.user.id,
									scopes: scopes
								}
							});
							if (tokenResult.statusCode != 200 && tokenResult.statusCode != 404) {
								throw new HttpServerError(tokenResult.statusCode, `session creation error: ${tokenResult.response.message}`);
							}
							if (tokenResult.statusCode == 404) {
								tokenResult = await streamingRest.request('post', '/auth/tokens', {
									body: {
										applicationId: config.applicationId,
										userId: req.user.id,
										scopes: scopes
									}
								});
								if (tokenResult.statusCode != 200) {
									throw new HttpServerError(tokenResult.statusCode, `session creation error: ${tokenResult.response.message}`);
								}
							}
							return tokenResult.response.token;
						};

						// get session accessToken
						const sessionToken = await getToken(config.accessTokenScopes.session);

						// get client-side sccessToken
						const clientSideToken = await getToken(config.accessTokenScopes.clientSide);

						req.session.token = sessionToken;
						req.session.clientSideToken = clientSideToken;
					}

					res.json({
						message: 'ok',
						accessToken: req.session.clientSideToken.accessToken,
						userId: req.session.clientSideToken.userId,
						scopes: config.accessTokenScopes.clientSide
					});
				}
				catch(err) {
					if (err instanceof HttpServerError) {
						err.isJson = true;
						next(err);
					}
					else {
						next(new HttpServerError(500, err.message, true));
					}
				}
			}
		)
		.delete(checkLogin, (req, res) => {
			try {
				if (req.session.token != null) {
					req.session.token = null;
					req.session.clientSideToken = null;
				}
				req.logout();
				res.json({ message: 'ok' });
			}
			catch (err) {
				if (err instanceof HttpServerError) {
					err.isJson = true;
					throw err;
				}
				else {
					throw new HttpServerError(500, err.message, true);
				}
			}
		});

	app.post('/session/register', async (req, res, next) => {
		try {
			// recaptcha
			let recaptchaResult;
			try {
				recaptchaResult = await request('https://www.google.com/recaptcha/api/siteverify', {
					method: 'POST',
					json: true,
					form: {
						secret: config.reCAPTCHA.secretKey,
						response: req.body.recaptchaToken
					}
				});
			}
			catch (err) {
				throw new HttpServerError(500, `recaptcha verification error: ${err.message}`, true);
			}
			if (recaptchaResult.success !== true) {
				throw new HttpServerError(400, `recaptcha verification error: ${JSON.stringify(recaptchaResult['error-codes'])}`, true);
			}

			// creation user
			const creationResult = await streamingRest.request('post', '/users', { body: req.body });
			if (!creationResult.response.user) {
				throw new HttpServerError(creationResult.statusCode || 500, `session register error: ${creationResult.response.message}`, true);
			}

			// creation session
			await createSession(req, streamingRest, config);

			res.json({
				message: 'ok',
				accessToken: req.session.clientSideToken.accessToken,
				userId: req.session.clientSideToken.userId,
				scopes: config.accessTokenScopes.clientSide
			});
		}
		catch (err) {
			if (err instanceof HttpServerError) {
				err.isJson = true;
				next(err);
			}
			else {
				next(new HttpServerError(500, err.message, true));
			}
		}
	});

	// pages

	const pages = [
		'/',
		'/general',
		'/users/:screenName',
		'/userlist',
		'/posts/:postId',
		'/dev'
	];

	for (const page of pages) {
		const type = getType(page);
		if (type == 'Object') {
			app.get(page.name, page.middle, (req, res) => res.renderPage());
		}
		else if (type == 'String') {
			app.get(page, (req, res) => res.renderPage());
		}
		else {
			throw new TypeError('invalid page info');
		}
	}

	// page not found
	app.use(() => { throw new HttpServerError(404, 'page not found'); });

	// csrf token
	app.use((err, req, res, next) => {
		if (err.code !== 'EBADCSRFTOKEN') return next(err);
		res.status(400).json({ error: { message: err.message } });
	});

	// HttpServerError
	app.use((err, req, res, next) => {
		if (err.status == null) return next(err);
		res.status(err.status);
		if (req.json !== false && req.method != 'GET') {
			res.json({ error: { message: err.message } });
		}
		else {
			res.renderPage({ error: err.message, code: err.status });
		}
	});

	// others
	app.use((err, req, res, next) => {
		log(err);
		res.status(500).renderPage({ error: err.message, code: 500 });
	});

	// == listening start ==

	const listen = (port) => new Promise((resolve, reject) => {
		if (port == null) reject(new ReferenceError('port is null reference'));
		if (typeof port != 'number') reject(new TypeError('port is not a number'));

		const http = app.listen(port, () => {
			log('listening on port:', port);
			resolve(http);
		});
	});
	const http = await listen(config.port);

	log('initialized');

	return {
		http: http,
		sessionStore: sessionStore
	};
};
