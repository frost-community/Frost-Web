/**
 * 型情報を文字列で取得します
 *
 * @return {'Object'|'Array'|'String'|'Number'|'Boolean'|'Function'|'AsyncFunction'|'Error'|'Promise'|'GeneratorFunction'|'Symbol'|'Null'|'Undefined'}
*/
module.exports = (object) => {
	return Object.prototype.toString.call(object).slice(8, -1);
};
