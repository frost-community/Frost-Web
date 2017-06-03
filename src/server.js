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
const moment = require('moment');
const path = require('path');
const requestApiAsync = require('./helpers/request-api-async');
const requestAsync = require('request-promise');
const server = require('http').Server;
const streamingServer = require('./streaming-server');

const urlConfigFile = 'https://raw.githubusercontent.com/Frost-Dev/Frost/master/config.json';
const questionResult = (ans) => (ans.toLowerCase()).indexOf('y') === 0;

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

				const configJson = (await requestAsync(urlConfigFile)).body;
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
				maxAge: moment().add(7, 'days').toDate()
			},
			resave: true,
			saveUninitialized: true
		}));

		// securities

		app.use(helmet({
			frameguard: { action: 'deny' }
		}));

		app.use(csurf());

		// == routings ==

		// static files

		app.use(express.static(path.join(__dirname, 'assets'), {
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

			if (!result.body.iceAuthKey) {
				throw new Error(`error: ${result.body.message}`);
			}

			result = await requestApiAsync('post', '/ice_auth/authorize_basic', {
				screenName: req.body.screenName,
				password: req.body.password
			}, {
				'X-Api-Version': 1.0,
				'X-Application-Key': config.web.applicationKey,
				'X-Access-Key': config.web.hostAccessKey,
				'X-Ice-Auth-Key': result.body.iceAuthKey
			});

			if (!result.body.accessKey) {
				throw new Error(`error: ${result.body.message}`);
			}

			req.session.accessKey = result.body.accessKey;
		};

		app.route('/session')
		.post((req, res) => {
			(async () => {
				try {
					await createSession(req, res);
					res.end();
				}
				catch(e) {
					console.log('faild');
					console.log(e);
					res.status(400).json({message: 'faild'});
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

					if (verifyResult.body.success !== true) {
						return res.status(400).json({message: 'faild to verify recaptcha'});
					}

					const result = await requestApiAsync('post', '/account', req.body, {
						'X-Api-Version': 1.0,
						'X-Application-Key': config.web.applicationKey,
						'X-Access-Key': config.web.hostAccessKey
					});

					if (!result.body.user) {
						return res.status(result.res.statusCode).send(result.body);
					}

					await createSession(req, res);
					res.end();
				}
				catch(err) {
					console.dir(err);
					res.status(500).json({message: typeof(err) == 'string' ? err : 'faild'});
				}
			})();
		});

		app.post('/applications', checkLogin, (req, res) => {
			(async () => {
				try {
					const verifyResult = await requestAsync('https://www.google.com/recaptcha/api/siteverify', {
						method: 'POST',
						json: true,
						form: {secret: config.web.reCAPTCHA.secretKey, response: req.body.recaptchaToken}
					});

					if (verifyResult.body.success !== true) {
						return res.status(400).json({message: 'faild to verify recaptcha'});
					}

					const result = await requestApiAsync('post', '/applications', req.body, {
						'X-Api-Version': 1.0,
						'X-Application-Key': config.web.applicationKey,
						'X-Access-Key': req.session.accessKey
					});

					res.status(result.body.statusCode).send(result.body);
				}
				catch(err) {
					console.dir(err);
					res.status(500).json({message: typeof(e) == 'string' ? err : 'faild'});
				}
			})();
		});

		// page middleware

		app.use((req, res, next) => {
			(async () => {
				const authorized = req.session.accessKey != null;

				req.isSmartPhone = isSmartPhone(req.header('User-Agent'));
				if (req.isSmartPhone) {
					// app.set('views', path.join(__dirname, 'views', 'sp'));
					app.set('views', path.join(__dirname, 'views'));
				}
				else {
					app.set('views', path.join(__dirname, 'views'));
				}

				// default render params
				req.renderParams = {
					authorized: authorized,
					csrfToken: req.csrfToken(),
					isSmartPhone: req.isSmartPhone
				};

				if (authorized) {
					const userId = req.session.accessKey.split('-')[0];
					req.renderParams.userId = userId;

					if (req.session.user == null) {
						const result = await requestApiAsync('get', '/users/' + userId, {}, {
							'X-Api-Version': 1.0,
							'X-Application-Key': config.web.applicationKey,
							'X-Access-Key': req.session.accessKey
						});
						req.session.user = result.body.user;
					}
					req.renderParams.account = req.session.user;
				}

				next();
			})();
		});

		// pages

		app.get('/', (req, res) => {
			if (req.session.accessKey != null) {
				res.render('home', Object.assign(req.renderParams, {}));
			}
			else {
				res.render('entrance', Object.assign(req.renderParams, {siteKey: config.web.reCAPTCHA.siteKey}));
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

					if (result.body.users == null || result.body.users.length == 0) {
						next();
					}
					else {
						res.render('user', Object.assign(req.renderParams, {user: result.body.users[0]}));
					}
				}
				catch(err) {
					console.dir(err);
					res.status(500).send(err);
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

					if (result.res.statusCode >= 400) {
						if (result.res.statusCode == 404) {
							next();
						}
						else {
							throw new Error(result.body.message);
						}
					}
					else {
						res.render('post', Object.assign(req.renderParams, {post: result.body.post}));
					}
				}
				catch(err) {
					console.dir(err);
					res.status(500).send(err);
				}
			})();
		});

		app.get('/dev', (req, res) => {
			res.render('dev', Object.assign(req.renderParams, {siteKey: config.web.reCAPTCHA.siteKey}));
		});

		// errors

		app.use((req, res, next) => {
			next({status: 404, message: 'page not found'});
		});

		app.use((err, req, res, next) => {
			res.status(500);
			res.render('error', {error: err});
		});

		// == start listening ==

		http.listen(config.web.port, () => {
			console.log(`listen on port: ${config.web.port}`);
		});

		streamingServer(http, sessionStore, config);

		console.log('Initialization complete.');
	}
	catch(err) {
		console.log('Unprocessed Server Error:');
		console.dir(err);
	}
};
