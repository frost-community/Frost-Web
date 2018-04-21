class WebSocketUtility {
	/**
	 * イベント名を構築します
	 */
	static createEventName(prefix, type) {
		return `${prefix}:${type}`;
	}
}
module.exports = WebSocketUtility;
