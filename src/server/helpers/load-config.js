const path = require('path');

/**
 * 設定ファイルを読み込みます
 */
module.exports = () => {
	try {
		return require(path.resolve('.configs/server-config.json'));
	}
	catch (err) {
		return null;
	}
};
