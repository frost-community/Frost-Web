const path = require('path');
const webpack = require('webpack');

const absolutePath = relative => path.join(__dirname, relative);

module.exports = {
	context: absolutePath('src/client'),
	entry: {
		bundle: './index.js'
	},
	output: {
		path: absolutePath('built/client'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.tag$/,
				enforce: 'pre',
				exclude: /node_modules/,
				use: [
					{
						loader: 'riot-tag-loader',
						options: {
							style: 'scss'
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
