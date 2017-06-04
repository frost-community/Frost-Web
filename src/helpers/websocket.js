'use strict';

const ws = require('websocket');
const WsServer = ws.server;
const WsClient = ws.client;
const EventEmitter = require('events').EventEmitter;

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
exports.Utility = Utility;

class Server {
	constructor(httpServer) {
		this._emitter = new EventEmitter();
		this._server = new WsServer({httpServer: httpServer});

		this._server.on('request', request => {
			const connection = request.accept();
			this._socketEmitter = new EventEmitter();
			this._emitter.emit('request', new ServerSocket(connection, this._socketEmitter));

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

	on(event, listener) {
		this._emitter.on(event, listener);
	}
}
exports.Server = Server;

class ServerSocket {
	constructor(connection, emitter) {
		this._connection = connection;
		this._emitter = emitter;
	}

	emit (event, content) {
		if (event == 'close') {
			console.log('invalid emit');
			return false;
		}

		this._connection.sendUTF(Utility.serialize(event, content));

		return true;
	}

	on (event, listener) {
		this._emitter.on(event, listener);
	}
}
exports.Socket = ServerSocket;

/* (e.g.)
const server = new WSServer(null);
server.on('request', socket => {
	socket.on('event_name1', data => {

	});
	socket.emit('event_name2', {});
});
*/

class Client {
	constructor() {
		this._client = new WsClient();
		this._emitter = new EventEmitter();

		this._client.on('connectFailed', err => {
			console.log('connect error');
		});

		this._client.on('connect', connection => {
			this._socketEmitter = new EventEmitter();
			this._emitter.emit('connect', new ClientSocket(connection, this._socketEmitter));

			connection.on('error', err => {
				console.log('error');
			});

			connection.on('close', () => {
				console.log('closed');
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
}
exports.Client = Client;

class ClientSocket {
	constructor(connection, emitter) {
		this._connection = connection;
		this._emitter = emitter;
	}

	on(event, listener) {
		this._emitter.on(event, listener);
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
exports.ClientSocket = ClientSocket;

/* (e.g.)
const client = new WSClient();
client.on('connect', socket => {
	socket.on('event_name1', data => {

	});
	socket.emit('event_name2', {});
});
client.connect('ws://localhost:8080/');
*/
