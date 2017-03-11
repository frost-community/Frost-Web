'use strict';

const fs = require('fs');

/**
 * 設定ファイルを読み込みます。
 * リポジトリ直下ディレクトリか、その１つ上層のディレクトリからconfig.jsonを読み込むことができます。
 * また、リポジトリ直下ディレクトリのconfig.jsonが優先的に読み込まれます。
 *
 * @return {Object} JSONデータのパース結果
 */
module.exports = () => {
	if (fs.existsSync(`${process.cwd()}/config.json`))
		return JSON.parse(fs.readFileSync(`${process.cwd()}/config.json`, 'utf8'));
	else if (fs.existsSync(`${process.cwd()}/../config.json`))
		return JSON.parse(fs.readFileSync(`${process.cwd()}/../config.json`, 'utf8'));
	else
		return null;
};
