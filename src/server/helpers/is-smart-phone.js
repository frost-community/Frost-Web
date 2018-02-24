/**
 * UserAgent情報から携帯端末かどうかを示す値を取得します。
 */
module.exports = (ua) => {
	return /(iPhone|iPad|iPod|Android|Windows Phone)/.test(ua);
};
