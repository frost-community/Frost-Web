const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const absolutePath = (relative) => path.resolve(__dirname, relative);

module.exports = {
	entry: {
		main: './src/client/index.js'
	},
	output: {
		path: absolutePath('./src/client.built'),
		filename: '[name].js'
	},
	plugins: [
		new webpack.ProvidePlugin({ riot: 'riot' }),
		new UglifyJSPlugin()
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
