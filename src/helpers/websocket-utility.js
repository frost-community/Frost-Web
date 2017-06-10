'use strict';

const WebSocket = require('websocket');
const events = require('websocket-events');

class WebSocketUtility {
	/**
	 * webSocketサーバーに接続してコネクションを取得します。
	 */
	static connectAsync(requestUrl, protocols, origin, headers) {
		return new Promise((resolve, reject) => {
			const client = new WebSocket.client();
			client.on('connect', (connection) => {
				resolve(connection);
			});
			client.on('connectFailed', (err) => {
				reject(err);
			});
			client.connect(requestUrl, protocols, origin, headers);
		});
	}

	/**
	 * コネクションに各種拡張メソッドを追加します。
	 */
	static addExtensionMethods(connection) {
		events(connection);

		/**
		 * 指定されたイベントが最初に受信されるまで待機します
		 */
		connection.onceAsync = (eventName) => new Promise((resolve) => {
			connection.once(eventName, (data) => {
				resolve(data);
			});
		});
	}

	/**
	 * イベント名を構築します
	 */
	static createEventName(prefix, type) {
		return `${prefix}:${type}`;
	}
}
module.exports = WebSocketUtility;
