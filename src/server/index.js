'use strict';

const bodyParser = require('body-parser');
const checkLogin = require('./helpers/check-login');
const compression = require('compression');
const connectRedis = require('connect-redis');
const csurf = require('csurf');
const express = require('express');
const expressSession = require('express-session');
const fs = require('fs');
const helmet = require('helmet');
const i = require('./helpers/input-async');
const isSmartPhone = require('./helpers/is-smart-phone');
const loadConfig = require('./helpers/load-config');
const path = require('path');
const requestApiAsync = require('./helpers/request-api-async');
const requestAsync = require('request-promise');
const server = require('http').Server;
const streamingServer = require('./helpers/streaming-server');

const urlConfigFile = 'https://raw.githubusercontent.com/Frost-Dev/Frost/master/config.json';
const questionResult = (ans) => (ans.toLowerCase()).indexOf('y') === 0;

const debug = false;

/**
 * Webクライアント向けのWebサーバ。
 */
module.exports = async () => {
	try {
		console.log('--------------------');
		console.log('  Frost-Web Server  ');
		console.log('--------------------');

		const app = express();
		const http = server(app);
		const sessionStore = new (connectRedis(expressSession))({});

		let config = loadConfig();
		if (config == null) {
			if (questionResult(await i('config file is not found. generate now? (y/n) > '))) {
				let configPath;

				if (questionResult(await i('generate config.json in the parent directory of repository? (y/n) > '))) {
					configPath = `${process.cwd()}/../config.json`;
				}
				else {
					configPath = `${process.cwd()}/config.json`;
				}

				const configJson = await requestAsync(urlConfigFile);
				fs.writeFileSync(configPath, configJson);
			}
			config = loadConfig();
		}

		if (config == null) {
			return;
		}

		// == app settings ==

		app.set('views', path.join(__dirname, 'views'));
		app.set('view engine', 'pug');

		app.use(bodyParser.urlencoded({extended: false}));
		app.use(bodyParser.json());

		// == Middlewares ==

		// compression

		app.use(compression({
			threshold: 0,
			level: 9,
			memLevel: 9
		}));

		// session

		app.use(expressSession({
			store: sessionStore,
			name: config.web.session.name,
			secret: config.web.session.SecretToken,
			cookie: {
				httpOnly: false,
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7days
			},
			resave: true,
			saveUninitialized: true,
			rolling: true
		}));

		// securities

		app.use(helmet({
			frameguard: { action: 'deny' }
		}));

		app.use(csurf());

		// == routings ==

		// static files

		app.use(express.static(path.join(__dirname, '../client'), {
			etag: false
		}));

		// internal APIs

		const createSession = async(req, res) => {
			let result;

			result = await requestApiAsync('post', '/ice_auth', {
				applicationKey: config.web.applicationKey
			}, {
				'X-Api-Version': 1.0
			});

			if (!result.iceAuthKey) {
				throw new Error(`session creation error: ${result.response.message}`);
			}

			try {
				result = await requestApiAsync('post', '/ice_auth/authorize_basic', {
					screenName: req.body.screenName,
					password: req.body.password
				}, {
					'X-Api-Version': 1.0,
					'X-Application-Key': config.web.applicationKey,
					'X-Access-Key': config.web.hostAccessKey,
					'X-Ice-Auth-Key': result.iceAuthKey
				});
			}
			catch(err) {
				throw new Error(`session creation authorize error: ${err.name}`);
			}

			if (!result.accessKey) {
				throw new Error(`error: ${result.response.message}`);
			}

			req.session.accessKey = result.accessKey;
		};

		app.route('/session')
		.post((req, res) => {
			(async () => {
				try {
					await createSession(req, res);
					res.end();
				}
				catch(err) {
					console.dir(err);
					res.status(400).json({message: 'failed to execute session creation'});
				}
			})();
		})
		.delete(checkLogin, (req, res) => {
			req.session.destroy();
			res.end();
		});

		app.post('/session/register', (req, res) => {
			(async () => {
				try {
					const verifyResult = await requestAsync('https://www.google.com/recaptcha/api/siteverify', {
						method: 'POST',
						json: true,
						form: {secret: config.web.reCAPTCHA.secretKey, response: req.body.recaptchaToken}
					});

					if (verifyResult.success !== true) {
						return res.status(400).json({message: 'failed to verify recaptcha'});
					}

					const result = await requestApiAsync('post', '/account', req.body, {
						'X-Api-Version': 1.0,
						'X-Application-Key': config.web.applicationKey,
						'X-Access-Key': config.web.hostAccessKey
					});

					if (!result.user) {
						return res.status(result.statusCode != null ? result.statusCode : 500).send(result);
					}

					await createSession(req, res);
					res.end();
				}
				catch(err) {
					console.dir(err);
					res.status(500).json({message: typeof(err) == 'string' ? err : 'failed'});
				}
			})();
		});

		// page middleware

		app.use((req, res, next) => {
			try {
				req.isSmartPhone = isSmartPhone(req.header('User-Agent'));
				app.set('views', path.join(__dirname, 'views'));

				res.renderPage = (pageId, pageParams, renderParams) => {
					pageParams = Object.assign(pageParams || {}, {
						csrf: req.csrfToken(),
						isSmartPhone: req.isSmartPhone,
						siteKey: config.web.reCAPTCHA.siteKey
					});

					// memo: クライアントサイドでは、パラメータ中にuserIdが存在するかどうかでWebSocketへの接続が必要かどうかを判断します。このコードはそのために必要です。
					const accessKey = req.session.accessKey;
					if (accessKey != null) {
						pageParams.userId = accessKey.split('-')[0];
					}

					let pageRenderParams = {
						id: pageId,
						scriptFile: '/bundle.js',
						params: pageParams
					};
					pageRenderParams = Object.assign(pageRenderParams, renderParams);

					res.render('page', pageRenderParams);
					if (debug) {
						console.log('render page:', pageId);
					}
				};

				next();
			}
			catch(err) {
				console.dir(err);
				res.status(500).json({message: 'failed to execute page middleware'});
			}
		});

		// pages

		app.get('/', (req, res) => {
			if (req.session.accessKey != null) {
				res.renderPage('home');
			}
			else {
				res.renderPage('entrance');
			}
		});

		app.get('/users/:screenName', (req, res, next) => {
			(async () => {
				try {
					const screenName = req.params.screenName;

					const result = await requestApiAsync('get', `/users?screen_names=${screenName}`, {}, {
						'X-Api-Version': 1.0,
						'X-Application-Key': config.web.applicationKey,
						'X-Access-Key': req.session.accessKey != null ? req.session.accessKey : config.web.hostAccessKey,
					});

					if (result.users == null || result.users.length == 0) {
						next();
					}
					else {
						res.renderPage('user');
					}
				}
				catch(err) {
					console.dir(err);
					next(err);
				}
			})();
		});

		app.get('/userlist', (req, res, next) => {
			(async () => {
				try {
					if (req.session.accessKey == null) {
						return res.status(403).json({message: 'Forbidden'});
					}

					const result = await requestApiAsync('get', '/users', {}, {
						'X-Api-Version': 1.0,
						'X-Application-Key': config.web.applicationKey,
						'X-Access-Key': req.session.accessKey != null ? req.session.accessKey : config.web.hostAccessKey,
					});

					res.renderPage('userlist');
				}
				catch(err) {
					console.dir(err);
					next(err);
				}
			})();
		});

		app.get('/posts/:postId', (req, res, next) => {
			(async () => {
				try {
					const postId = req.params.postId;

					const result = await requestApiAsync('get', `/posts/${postId}`, {}, {
						'X-Api-Version': 1.0,
						'X-Application-Key': config.web.applicationKey,
						'X-Access-Key': req.session.accessKey != null ? req.session.accessKey : config.web.hostAccessKey,
					});

					if (result.statusCode >= 400) {
						if (result.statusCode == 404) {
							next();
						}
						else {
							throw new Error(result.response.message);
						}
					}
					else {
						res.renderPage('post');
					}
				}
				catch(err) {
					console.dir(err);
					res.status(500).json({message: typeof(err) == 'string' ? err : 'failed'});
				}
			})();
		});

		app.get('/dev', (req, res) => {
			res.renderPage('dev');
		});

		// errors

		app.use((req, res, next) => {
			next({status: 404, message: 'page not found'});
		});

		app.use((err, req, res, next) => {
			err.status = err.status || 500;
			res.status(err.status).renderPage('error', {error: err.message, errorCode: err.status});
		});

		// == start listening ==

		http.listen(config.web.port, () => {
			console.log(`listen on port: ${config.web.port}`);
		});

		streamingServer(http, sessionStore, false, config);

		console.log('Initialization complete.');
	}
	catch(err) {
		console.log('Unprocessed Server Error:');
		console.dir(err);
	}
};
