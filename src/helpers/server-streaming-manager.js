'use strict';

/**
 * SocketIO.Serverのラッパークラス
 */
class ServerStreamingManager {
	constructor(ioServer, ioServerSocket) {
		this.ioServer = ioServer;
		this.ioServerSocket = ioServerSocket;
	}

	/**
	 * ストリームに基本的なイベントを発行します
	 */
	stream(arg1, arg2, arg3) {
		if (arguments.length == 3) {
			const prefix = arg1;
			const type = arg2;
			const data = arg3;

			this.stream(`${prefix}:${type}`, data);
		}
		else if (arguments.length == 2) {
			const type = arg1;
			const data = arg2;

			this.ioServer.to(this.ioServerSocket.id).emit(type, data);
		}
		else {
			throw new Error('invalid arguments count');
		}
	}

	/**
	 * イベントハンドラを登録します
	 */
	on(arg1, arg2, arg3) {
		if (arguments.length == 3) {
			const prefix = arg1;
			const type = arg2;
			const callback = arg3;

			this.on(`${prefix}:${type}`, callback);
		}
		else if (arguments.length == 2) {
			const type = arg1;
			const callback = arg2;

			this.ioServerSocket.on(type, data => {
				callback(data);
			});
		}
		else {
			throw new Error('invalid arguments count');
		}
	}

	/**
	 * ストリームを切断します
	 */
	disconnect() {
		this.ioServerSocket.disconnect();
	}

	/**
	 * ストリーム切断時のイベントハンドラを登録します
	 */
	onDisconnect(callback) {
		this.ioServerSocket.on('disconnect', callback);
	}
}

module.exports = ServerStreamingManager;
