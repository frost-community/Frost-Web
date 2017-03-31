'use strict';

const config = require('./helpers/loadConfig')();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const csurf = require('csurf');
const path = require('path');
const moment = require('moment');
const helmet = require('helmet');
const requestApi = require('./helpers/requestApi');
const checkLogin = require('./helpers/checkLogin');

console.log('--------------------');
console.log('  Frost-Web Server  ');
console.log('--------------------');

const app = express();

// == app settings ==
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// == and session ==
app.use(session({
	store: new RedisStore({}),
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
app.use(express.static(path.join(__dirname, 'assets')));

// internal APIs

const signin = async(req) => {
	let result;

	result = await requestApi('post', '/ice_auth', {
		applicationKey: config.web.applicationKey
	});

	result = await requestApi('post', '/ice_auth/authorize_basic', {
		screenName: req.body.screenName,
		password: req.body.password
	}, {
		'X-Application-Key': config.web.applicationKey,
		'X-Access-Key': config.web.hostAccessKey,
		'X-Ice-Auth-Key': result.body.iceAuthKey
	});

	if (!result.body.accessKey)
		throw new Error(`error: ${result.body.message}`);

	req.session.accessKey = result.body.accessKey;
};

app.post('/signin', (req, res) => {
	(async () => {
		try {
			await signin(req);
			res.send('succeeded');
		}
		catch(e) {
			console.log('failure');
			console.log(e);
			res.status(400).send('faild');
		}
	})();
});

app.post('/signup', (req, res) => {
	(async () => {
		try {
			const result = await requestApi('post', '/account', req.body, {
				'X-Application-Key': config.web.applicationKey,
				'X-Access-Key': config.web.hostAccessKey
			});

			if (!result.body.user)
				throw new Error(`error: ${result.body.toString()}`);

			await signin(req);
			res.send('succeeded');
		}
		catch(e) {
			console.log('failure');
			console.log(e);
			res.status(400).send('faild');
		}
	})();
});

app.post('/signout', checkLogin, (req, res) => {
	req.session.destroy();
	res.send('succeeded');
});

// pages

app.get('/', (req, res) => {
	if (req.session.accessKey) {
		res.render('page', {title: 'Frost', pageName: 'home', csrfToken: req.csrfToken()});
	}
	else {
		res.render('page', {title: 'Frost', pageName: 'entrance', csrfToken: req.csrfToken()});
	}
});

app.get('/users/:screenName', (req, res) => {
	res.render('page', {title: `Frost - ${req.params.screenName}さんのページ`, pageName: 'user', csrfToken: req.csrfToken()});
});

app.get('/posts/:postId', (req, res) => {
	const screenName = 'hoge';
	res.render('page', {title: `Frost - ${screenName}さんの投稿`, pageName: 'post', csrfToken: req.csrfToken()});
});

app.get('/dev', (req, res) => {
	res.render('page', {title: 'Frost Developers Center', pageName: 'dev', csrfToken: req.csrfToken()});
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

module.exports = app;
