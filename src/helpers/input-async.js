'use strict';

const prominence = require('prominence');

/**
 * 一行の入力を受け付けます。
 */
module.exports = async (message) => {
	const rl = require('readline').createInterface(process.stdin, process.stdout);
	const ans = await prominence(rl).question(message);
	rl.close();

	return ans;
};
