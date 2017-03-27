'use strict';

const config = require('./helpers/loadConfig')();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const csrf = require('csurf');
const path = require('path');
const moment = require('moment');

const app = express();

console.log('--------------------');
console.log('  Frost-Web Server  ');
console.log('--------------------');

// setting
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(session({
	store: new RedisStore({}),
	secret: config.web.session.SecretToken,
	cookie: {
		httpOnly: false,
		maxAge: moment().add('days', 7).toDate()
	}
}));

app.use(csrf({ cookie: true })); // csrfToken: req.csrfToken()

app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
	res.render('entrance');
});

app.listen(config.web.port, () => {
	console.log(`listen on port: ${config.web.port}`);
});

module.exports = app;
