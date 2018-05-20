const bodyParser = require('body-parser');
const checkLogin = require('./helpers/check-login');
const compression = require('compression');
const connectRedis = require('connect-redis');
const validateCredential = require('./helpers/validate-credential');
const csurf = require('csurf');
const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');
const helmet = require('helmet');
const HttpServerError = require('./helpers/http-server-error');
const isSmartPhone = require('./helpers/is-smart-phone');
const path = require('path');
const request = require('request-promise');
const getType = require('./helpers/get-type');
const passport = require('passport');
const qs = require('qs');

const getToken = async (userId, scopes, streamingRest, config) => {
	let tokenResult = await streamingRest.request('get', '/auth/tokens', {
		query: {
			applicationId: config.applicationId,
			userId: userId,
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
				userId: userId,
				scopes: scopes
			}
		});
		if (tokenResult.statusCode != 200) {
			throw new HttpServerError(tokenResult.statusCode, `session creation error: ${tokenResult.response.message}`);
		}
	}
	return tokenResult.response.token;
};

/**
 * Webページの配布と各種操作を提供します
 */
module.exports = async (db, streamingRest, oAuthServer, config) => {
	const log = (...args) => {
		console.log('[http server]', ...args);
	};
	const debugLog = (...args) => {
		if (config.debug) {
			log(...args);
		}
	};

	const app = express();
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'pug');

	// == middlewares ==

	const sessionStore = new (connectRedis(session))();
	app.use(session({
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
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(compression({ threshold: 0, level: 9, memLevel: 9 }));
	app.use(helmet({ frameguard: { action: 'deny' } }));
	app.use(flash());
	app.use(csurf());
	app.use(passport.initialize());
	app.use(passport.session());

	// custom middleware
	app.use((req, res, next) => {
		req.isSmartPhone = isSmartPhone(req.header('User-Agent'));

		res.renderPage = (params) => {
			params = Object.assign(params || {}, {
				csrf: req.csrfToken(),
				isSmartPhone: req.isSmartPhone,
				siteKey: config.reCAPTCHA.siteKey,
				errors: req.flash('error')
			});

			// memo: クライアントサイドでは、パラメータ中にuserIdが存在するかどうかでWebSocketへの接続が必要かどうかを判断します。このコードはそのために必要です。
			if (req.session.token != null) {
				params.userId = req.session.token.userId;
			}

			res.render('main', { params });
		};

		debugLog('req:', req.method, req.path);

		next();
	});

	// static files
	app.use(express.static(path.join(__dirname, '../client.built'), { etag: false }));

	// == routings ==

	// oauth2

	app.get('/oauth/authorize',
		(req, res, next) => {
			// ログイン済みの時は認可のミドルウェアを呼び出し
			if (req.user != null) {
				oAuthServer.authorizeMiddle()(req, res, next);
			}
			// 未ログイン時はそのまま次へ
			else {
				next();
			}
		}, (req, res) => {
			let params = {
				needLogin: (req.user == null),
				csrf: req.csrfToken(),
				errors: req.flash('error')
			};
			// ログイン済みの時は認可フォームを表示
			if (req.user != null) {
				Object.assign(params, {
					siteKey: config.reCAPTCHA.siteKey,
					userId: req.user.id,
					transactionId: req.oauth2.transactionID
				});
			}
			// 未ログイン時はログインフォームを表示
			else {
				Object.assign(params, {
					redirectionQuery: req.query
				});
			}
			res.render('appAuth', { params });
		});
	app.post('/oauth/authorize', oAuthServer.decisionMiddle());
	app.post('/oauth/token', oAuthServer.tokenMiddle());

	// session

	app.route('/session')
		.post((req, res, next) => {
			passport.authenticate('login', async (err, user, info) => {
				try {
					if (user != null) {
						if (req.session.token == null) {
							const sessionToken = await getToken(user.id, config.accessTokenScopes.session, streamingRest, config);
							const clientSideToken = await getToken(user.id, config.accessTokenScopes.clientSide, streamingRest, config);

							req.session.token = sessionToken;
							req.session.clientSideToken = clientSideToken;
						}

						// NOTE: クライアントサイドへ渡すために一旦Cookieに付ける
						res.cookie('accessToken', req.session.clientSideToken.accessToken);

						req.login(user, (err) => {
						});
					}

					// control redirect target
					const redirectWhiteList = {
						oauth: '/oauth/authorize'
					};
					let redirectPath = redirectWhiteList[req.query.redirect_type] || '/';
					if (req.query.redirect_type != null) {
						delete req.query.redirect_type;
					}
					redirectPath += qs.stringify(req.query, { addQueryPrefix: true });

					res.redirect(redirectPath);
				}
				catch(authErr) {
					next(authErr);
				}
			})(req, res, next);
		})
		.delete(checkLogin, (req, res) => {
			if (req.session.token != null) {
				req.session.token = null;
				req.session.clientSideToken = null;
			}
			req.logout();
			res.json({ message: 'ok' });
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
				throw new HttpServerError(500, `recaptcha: ${err.message}`, true);
			}
			if (recaptchaResult.success !== true) {
				throw new HttpServerError(400, `invalid recaptcha input. ${JSON.stringify(recaptchaResult['error-codes'])}`, true);
			}

			// create user
			const creationResult = await streamingRest.request('post', '/users', { body: req.body });
			if (!creationResult.response.user) {
				throw new HttpServerError(500, `${creationResult.statusCode} - ${creationResult.response.message}`, true);
			}

			const user = await validateCredential(req.body.screenName, req.body.password, streamingRest);

			const sessionToken = await getToken(user.id, config.accessTokenScopes.session, streamingRest, config);
			const clientSideToken = await getToken(user.id, config.accessTokenScopes.clientSide, streamingRest, config);

			req.session.token = sessionToken;
			req.session.clientSideToken = clientSideToken;

			res.json({
				message: 'ok',
				accessToken: req.session.clientSideToken.accessToken,
				userId: req.session.clientSideToken.userId,
				scopes: config.accessTokenScopes.clientSide
			});
		}
		catch (err) {
			next(err);
		}
	});

	// internal apis

	app.post('/app/secret', async (req, res, next) => {
		try {
			const appId = req.body.id;

			const appResult = await streamingRest.request('get', `/applications/${appId}`);
			if (appResult.statusCode != 200) {
				throw new HttpServerError(400, 'invalid applicationId');
			}
			const app = appResult.response.application;

			if (app.creatorId != req.user.id) {
				throw new HttpServerError(400, 'you do not have this application');
			}

			const appSecretResult = await streamingRest.request('get', `/applications/${appId}/secret`);
			if (appSecretResult.statusCode != 200) {
				throw new HttpServerError(appSecretResult.statusCode, appSecretResult.response.message);
			}

			res.json({ secret: appSecretResult.response.secret });
		}
		catch (err) {
			next(err);
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

	// error: page not found
	app.use(() => { throw new HttpServerError(404, 'page not found'); });

	// error: csrf token
	app.use((err, req, res, next) => {
		if (err.code !== 'EBADCSRFTOKEN') return next(err);
		res.status(400).json({ error: { message: err.message } });
	});

	// error: http error
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

	// error: internal error
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
