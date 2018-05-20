/** サーバから渡されたmetaタグのパラメータを読み込みます */
module.exports = () => {
	const element = document.getElementsByName('frost-params').item(0);
	return element != null ? JSON.parse(element.content) : {};
};
