const { client: Client, connection: Connection } = require('websocket');
const { EventEmitter } = require('events');
const wait = require('./wait');

class ReconnectingWebSocketNode extends EventEmitter {
	/** @param {Connection} connection */
	constructor(connection, connectParams = {}, options) {
		super();
		this.connectParams = connectParams;
		this.needReconnect = true;
		this._updateConnection(connection);
	}

	static async connect(requestUrl, protocols, origin, headers, options) {
		const connection = await ReconnectingWebSocketNode._connect(requestUrl, protocols, origin, headers, options);
		return new ReconnectingWebSocketNode(connection, { requestUrl, protocols, origin, headers, options }, options);
	}

	static _connect(requestUrl, protocols, origin, headers, options) {
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

	_updateConnection(connection) {
		const reconnect = async () => {
			await wait(5000);

			const { requestUrl, protocols, origin, headers, options } = this.connectParams;
			try {
				// コネクションの置き換え
				const connection = await ReconnectingWebSocketNode._connect(requestUrl, protocols, origin, headers, options);
				this._updateConnection(connection);
				return true;
			}
			catch (err) {
				return false;
			}
		};

		this._linkConnection(connection);
		connection.on('close', async () => {
			while (this.needReconnect) {
				console.log('reconnecting...');
				if (await reconnect()) {
					console.log('reconnected!');
					break;
				}
			}
		});
		this.connection = connection;
	}

	_linkConnection(connection) {
		const linkEvent = (name) => {
			connection.on(name, (...args) => this.emit(name, ...args));
		};
		const events = ['message', 'frame', 'close', 'error', 'ping', 'pong'];
		for (const event of events) {
			linkEvent(event);
		}

		const linkMethod = name => {
			this[name] = (...args) => connection[name](...args);
		};
		const methods = ['drop', 'sendUTF', 'sendBytes', 'send', 'ping', 'pong', 'sendFrame'];
		for (const method of methods) {
			linkMethod(method);
		}
		this.close = (...args) => {
			this.needReconnect = false;
			connection.close(...args);
		};
	}
}
module.exports = ReconnectingWebSocketNode;
