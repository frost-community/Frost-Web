'use strict';

const autoprefixer = require('autoprefixer-stylus');
const config = require('./helpers/loadConfig')();
const express = require('express');
const path = require('path');
const stylus = require('stylus');
const nib = require('nib');

const app = express();

console.log('--------------------');
console.log('  Frost-Web Server  ');
console.log('--------------------');

// setting
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')

app.use(stylus.middleware({
	src: path.join(__dirname, 'assets'),
	compile: (str, path) => stylus(str).set('filename', path).set('compress', true).use(nib())
}));

app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
	res.render('entrance');
});

app.listen(config.web.port, () => {
	console.log(`listen on port: ${config.web.port}`);
});
