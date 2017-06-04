'use strict';

const ws = require('websocket');
const WsServer = ws.server;
const WsClient = ws.client;
const EventEmitter = require('events').EventEmitter;

class Server {
	constructor(httpServer) {
		this._emitter = new EventEmitter();
		this._server = new WsServer({httpServer: httpServer});

		this._server.on('request', request => {
			const connection = request.accept(); // or request.reject()
			this._socketEmitter = new EventEmitter();
			this._emitter.emit('request', new Connection(connection, this._socketEmitter));

			connection.on('close', (reasonCode, description) => {
				this._socketEmitter.emit('close', {reasonCode: reasonCode, description: description});
			});

			connection.on('message', message => {
				if (message.type === 'utf8') {
					let event;
					try {
						event = Utility.parse(message.utf8Data);
					}
					catch (err) {
						console.dir(err);
					}

					this._socketEmitter.emit(event.name, event.content);
				}
				else {
					console.log('unknown message');
				}
			});
		});
	}

	onRequest(listener) {
		this._emitter.on('request', listener);
	}
}

class Client {
	constructor() {
		this._client = new WsClient();
		this._emitter = new EventEmitter();

		this._client.on('connectFailed', err => {
			this._emitter.emit('connect-failed', err);
		});

		this._client.on('connect', connection => {
			this._socketEmitter = new EventEmitter();
			this._emitter.emit('connect', new Connection(connection, this._socketEmitter));

			connection.on('error', err => {
				this._socketEmitter.emit('error', err);
			});

			connection.on('close', () => {
				this._socketEmitter.emit('close');
			});

			connection.on('message', message => {
				if (message.type === 'utf8') {
					let event;
					try {
						event = Utility.parse(message.utf8Data);
					}
					catch (err) {
						console.dir(err);
					}

					this._socketEmitter.emit(event.name, event.content);
				}
			});
		});
	}

	connect(url) {
		this._client.connect(url);
	}

	on(event, listener) {
		this._emitter.on(event, listener);
	}

	onConnect(listener) {
		this._emitter.on('connect', listener);
	}
}

class Connection {
	constructor(connection, emitter) {
		this._connection = connection;
		this._emitter = emitter;
	}

	on(event, listener) {
		this._emitter.on(event, listener);
	}

	onClose (listener) {
		this._socketEmitter.on('close', listener);
	}

	emit(event, content) {
		if (this._connection.connected) {
			this._connection.sendUTF(null);
		}
	}

	close() {
		return this._connection.close();
	}
}

class Utility {
	static parse (json) {
		const event = JSON.parse(json);
		if (event.name == null || event.content == null || typeof event.name != 'string') {
			throw new Error('invalid event data');
		}
		return event;
	}

	static serialize(eventName, content) {
		return JSON.stringify({name: eventName, content: content});
	}
}

/* (e.g.)
const server = new Server(null);
server.onRequest(connection => {
	connection.on('event_name1', data => {

	});
	connection.emit('event_name2', {});
});

const client = new Client();
client.onConnect(connection => {
	connection.on('event_name1', data => {

	});
	connection.emit('event_name2', {});
});
client.connect('ws://localhost:8001/');
*/

exports.Server = Server;
exports.Client = Client;
exports.Connection = Connection;
exports.Utility = Utility;
