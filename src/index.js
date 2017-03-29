'use strict';

const config = require('./helpers/loadConfig')();
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const csurf = require('csurf');
const path = require('path');
const moment = require('moment');
const helmet = require('helmet');

console.log('--------------------');
console.log('  Frost-Web Server  ');
console.log('--------------------');

const app = express();

// app settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// and session
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

// securities
app.use(helmet({
	frameguard: { action: 'deny' }
}));

app.use(csurf());

// routings
app.use(express.static(path.join(__dirname, 'assets')));

app.post('/signup', (req, res) => {
	req.session.accessKey = 'hoge';
	res.send('ok');
});

app.post('/signin', (req, res) => {
	req.session.accessKey = 'hoge';
	res.send('ok');
});

app.post('/signout', (req, res) => {
	delete req.session.accessKey;
	res.send('ok');
});

app.get('/', (req, res) => {
	if (req.session.accessKey)
		res.render('home', {csrfToken: req.csrfToken()});
	else
		res.render('entrance', {csrfToken: req.csrfToken()});
});

app.get('/users/:screenName', (req, res) => {
	res.render('user', {csrfToken: req.csrfToken()});
});

app.get('/posts/:postId', (req, res) => {
	res.render('post', {csrfToken: req.csrfToken()});
});

app.get('/dev', (req, res) => {
	res.render('dev', {csrfToken: req.csrfToken()});
});

app.use((req, res, next) => {
	next({status: 404, message: 'page not found'});
});

app.use((err, req, res, next) => {
	res.status(500);
	res.render('error', { error: err, csrfToken: req.csrfToken() });
});

// start listening
app.listen(config.web.port, () => {
	console.log(`listen on port: ${config.web.port}`);
});

module.exports = app;
