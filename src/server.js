'use strict';

const fs = require('fs');
const requestAsync = require('./helpers/requestAsync');
const i = require('./helpers/readline');
const loadConfig = require('./helpers/loadConfig');
const express = require('express');
const httpClass = require('http');
const app = express();
const http = httpClass.Server(app);
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const csurf = require('csurf');
const path = require('path');
const moment = require('moment');
const helmet = require('helmet');
const request = require('./helpers/requestAsync');
const requestApi = require('./helpers/requestApi');
const checkLogin = require('./helpers/checkLogin');

const urlConfigFile = 'https://raw.githubusercontent.com/Frost-Dev/Frost/master/config.json';
const questionResult = (ans) => (ans.toLowerCase()).indexOf('y') === 0;

module.exports = async () => {
	try {
		console.log('--------------------');
		console.log('  Frost-Web Server  ');
		console.log('--------------------');

		let config = loadConfig();
		if (config == null) {
			if (questionResult(await i('config file is not found. generate now? (y/n) > '))) {
				let configPath;

				if (questionResult(await i('generate config.json in the parent directory of repository? (y/n) > ')))
					configPath = `${process.cwd()}/../config.json`;
				else
					configPath = `${process.cwd()}/config.json`;

				const configJson = (await requestAsync(urlConfigFile)).body;
				fs.writeFileSync(configPath, configJson);
			}
			config = loadConfig();
		}

		if (config == null)
			return;

		// == app settings ==

		app.set('views', path.join(__dirname, 'views'));
		app.set('view engine', 'pug');

		app.use(bodyParser.urlencoded({extended: false}));
		app.use(bodyParser.json());

		// == and session ==

		const sessionStore = new RedisStore({});

		app.use(session({
			store: sessionStore,
			secret: config.web.session.SecretToken,
			cookie: {
				httpOnly: false,
				maxAge: moment().add(7, 'days').toDate()
			},
			resave: true,
			saveUninitialized: true
		}));

		// == securities ==

		app.use(helmet({
			frameguard: { action: 'deny' }
		}));

		app.use(csurf());

		// == routings ==

		// static files

		app.use(express.static(path.join(__dirname, 'assets')));

		// internal APIs

		const createSession = async(req, res) => {
			let result;

			result = await requestApi('post', '/ice_auth', {
				applicationKey: config.web.applicationKey
			}, {
				'X-Api-Version': 1.0
			});

			if (!result.body.iceAuthKey)
				throw new Error(`error: ${result.body.message}`);

			result = await requestApi('post', '/ice_auth/authorize_basic', {
				screenName: req.body.screenName,
				password: req.body.password
			}, {
				'X-Api-Version': 1.0,
				'X-Application-Key': config.web.applicationKey,
				'X-Access-Key': config.web.hostAccessKey,
				'X-Ice-Auth-Key': result.body.iceAuthKey
			});

			if (!result.body.accessKey)
				throw new Error(`error: ${result.body.message}`);

			req.session.accessKey = result.body.accessKey;
		};

		app.route('/session')
		.post((req, res) => {
			(async () => {
				try {
					await createSession(req, res);
					res.json({message: 'succeeded'});
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
			res.json({message: 'succeeded'});
		});

		app.post('/session/register', (req, res) => {
			(async () => {
				try {
					const verifyResult = await request('https://www.google.com/recaptcha/api/siteverify', {
						method: 'POST',
						json: true,
						form: {secret: config.web.reCAPTCHA.secretKey, response: req.body.recaptchaToken}
					});

					if (verifyResult.body.success !== true)
						res.status(400).json({message: 'faild to verify recaptcha'});

					const result = await requestApi('post', '/account', req.body, {
						'X-Api-Version': 1.0,
						'X-Application-Key': config.web.applicationKey,
						'X-Access-Key': config.web.hostAccessKey
					});

					if (!result.body.user)
						return res.status(result.res.statusCode).send(result.body);

					await createSession(req, res);
					res.json({message: 'succeeded'});
				}
				catch(err) {
					console.log('faild');
					console.log(err);
					res.status(500).json({message: typeof(err) == 'string' ? err : 'faild'});
				}
			})();
		});

		app.post('/applications', checkLogin, (req, res) => {
			(async () => {
				try {
					const verifyResult = await request('https://www.google.com/recaptcha/api/siteverify', {
						method: 'POST',
						json: true,
						form: {secret: config.web.reCAPTCHA.secretKey, response: req.body.recaptchaToken}
					});

					if (verifyResult.body.success !== true)
						res.status(400).json({message: 'faild to verify recaptcha'});

					const result = await requestApi('post', '/applications', req.body, {
						'X-Api-Version': 1.0,
						'X-Application-Key': config.web.applicationKey,
						'X-Access-Key': req.session.accessKey
					});

					res.status(result.body.statusCode).send(result.body);
				}
				catch(err) {
					console.log('faild');
					console.log(err);
					res.status(500).json({message: typeof(e) == 'string' ? err : 'faild'});
				}
			})();
		});

		// pages

		app.get('/', (req, res) => {
			if (req.session.accessKey) {
				res.render('home', {csrfToken: req.csrfToken()});
			}
			else {
				res.render('entrance', {csrfToken: req.csrfToken(), siteKey: config.web.reCAPTCHA.siteKey});
			}
		});

		app.get('/users/:screenName', (req, res, next) => {
			(async () => {
				try {
					const screenName = req.params.screenName;

					const result = await requestApi('get', `/users?screen_names=${screenName}`, {}, {
						'X-Api-Version': 1.0,
						'X-Application-Key': config.web.applicationKey,
						'X-Access-Key': req.session.accessKey != null ? req.session.accessKey : config.web.hostAccessKey,
					});

					if (result.body.users == null || result.body.users.length == 0) {
						next();
					}
					else {
						res.render('user', {user: result.body.users[0], csrfToken: req.csrfToken()});
					}
				}
				catch(err) {
					res.status(500).send(err);
				}
			})();
		});

		app.get('/posts/:postId', (req, res) => {
			res.render('post', {post: {user: {screenName: 'hoge'}}, csrfToken: req.csrfToken()});
		});

		app.get('/dev', (req, res) => {
			res.render('page', {title: 'Frost Developers Center', pageName: 'dev', csrfToken: req.csrfToken(), siteKey: config.web.reCAPTCHA.siteKey});
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

		app.listen(config.web.port, () => {
			console.log(`listen on port: ${config.web.port}`);
		});

		require('./streaming-proxy')(http, sessionStore, config);
	}
	catch(err) {
		console.log(`Unprocessed Server Error: ${err.stack}`);
	}
};
