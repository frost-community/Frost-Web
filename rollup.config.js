import riot from 'rollup-plugin-riot';
import nodeResolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';

export default {
	entry: './src/resources/main.js',
	dest: './built/resources/bundle.js',
	plugins: [
		riot({
			style: 'scss'
		}),
		nodeResolve({ jsnext: true }),
		//commonjs(), // CommonJSモジュールをES6に変換
		buble()
	],
	format: 'iife'
};
