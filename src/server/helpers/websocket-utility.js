const { client : Client, connection : Connection } = require('websocket');

class WebSocketUtility {
	/** @return {Promise<Connection>} */
	static connect(requestUrl, protocols, origin, headers, options) {
		return new Promise((resolve, reject) => {
			const client = new Client();
			client.on('connect', (connection) => {
				resolve(connection);
			});
			client.on('connectFailed', (err) => {
				reject(err);
			});
			client.connect(requestUrl, protocols, origin, headers, options);
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
