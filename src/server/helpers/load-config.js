'use strict';

/**
 * 設定ファイルを読み込みます。
 * リポジトリ直下ディレクトリか、その１つ上層のディレクトリからconfig.jsonを読み込むことができます。
 * リポジトリ直下ディレクトリのconfig.jsonから優先的に読み込まれます。
 *
 * @return {Object} JSONデータのパース結果
 */
module.exports = () => {
	try {
		return require(`${process.cwd()}/config.json`);
	}
	catch(e) {
		try {
			return require(`${process.cwd()}/../config.json`);
		}
		catch(e2) {
			return null;
		}
	}
};
