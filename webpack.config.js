const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const loadConfig = require('./src/server/helpers/load-config');

const absolutePath = (relative) => path.resolve(__dirname, relative);
let debug = false;

const config = loadConfig();
if (config != null) {
	debug = config.debug;
}

const webpackConfig = {
	entry: {
		frost: './src/client/mainEntry.js',
		'frost-oauth': './src/client/appAuthEntry.js'
	},
	output: {
		path: absolutePath('./src/client.built'),
		filename: '[name].js'
	},
	plugins: [
		new webpack.ProvidePlugin({ riot: 'riot' })
	],
	module: {
		rules: [
			{
				test: /\.js$|\.tag$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
				test: /\.tag$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'riot-tag-loader',
						options: { style: 'scss' }
					}
				]
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			}
		]
	}
};

// デバックモード有効時は、コードの圧縮を無効に
if (!debug) {
	webpackConfig.plugins.push(new UglifyJSPlugin());
}

module.exports = webpackConfig;
