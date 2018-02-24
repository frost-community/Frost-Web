const readline = require('readline');
const prominence = require('prominence');

/**
 * 一行の入力を受け付けます。
 */
module.exports = async (message) => {
	const rl = prominence(readline.createInterface(process.stdin, process.stdout));
	const ans = await rl.question(message);
	rl.close();

	return ans;
};
