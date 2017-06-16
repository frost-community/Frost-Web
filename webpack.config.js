const path = require('path');
const webpack = require('webpack');

const absolutePath = relative => path.join(__dirname, relative);

module.exports = {
	context: absolutePath('src/assets/scripts'),
	entry: './app.js',
	output: {
		path: absolutePath('built/assets'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.tag$/,
				enforce: 'pre',
				exclude: /node_modules/,
				use: [
					{
						loader: 'riotjs-loader',
						options: {
							// template: 'pug'
						}
					}
				]
			},
			{
				test: /\.js$|\.tag$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {}
					}
				]
			}
		]
	},
	resolve: {
		extensions: ['*', '.js', '.tag']
	},
	plugins: [
		new webpack.ProvidePlugin({
			riot: 'riot'
		})
	]
};
