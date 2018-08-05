module.exports = (message) => new Promise((resolve) => {
	const rl = require('readline').createInterface(process.stdin, process.stdout);
	rl.question(message, (ans) => {
		resolve(ans);
		rl.close();
	});
});
