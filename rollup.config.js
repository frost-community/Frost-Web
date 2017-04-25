import riot from 'rollup-plugin-riot';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';

export default {
	entry: './src/assets/scripts/main.js',
	dest: './built/assets/scripts/bundle.js',
	plugins: [
		riot({
			style: 'scss'
		}),
		resolve({ jsnext: true }),
		commonjs(), // CommonJSモジュールをES6に変換
		buble({transforms: { forOf: false }})
	],
	format: 'iife'
};
