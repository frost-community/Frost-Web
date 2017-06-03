'use strict';

const prominence = require('prominence');

module.exports = async (message) => {
	const rl = require('readline').createInterface(process.stdin, process.stdout);
	const ans = await prominence(rl).question(message);
	rl.close();

	return ans;
};
