'use strict';

const WebSocket = require('websocket');
const events = require('websocket-events');

class WebSocketClientUtility {
	/**
	 * 非同期的に接続してコネクションを取得します。
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
}
exports.ClientUtility = WebSocketClientUtility;

class WebSocketConnectionUtility {
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

	static createEventName(prefix, type) {
		return `${prefix}:${type}`;
	}
}
exports.ConnectionUtility = WebSocketConnectionUtility;
