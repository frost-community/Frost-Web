'use strict';

/**
 * SocketIO.Clientのラッパークラス
 */
class ClientStreamingManager {
	constructor(ioClientSocket) {
		this.ioClientSocket = ioClientSocket;
	}

	/**
	 * 指定されたイベントが最初に受信されるまで待機します
	 */
	waitEventAsync(eventName) {
		return new Promise((resolve, reject) => {
			const handler = (data) => {
				this.ioClientSocket.removeListener(eventName, handler);
				resolve(data);
			};
			this.ioClientSocket.on(eventName, handler);
		});
	}

	/**
	 * connectイベントが最初に受信されるまで待機します
	 */
	waitConnectAsync() {
		return this.waitEventAsync('connect');
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

			this.ioClientSocket.emit(type, data);
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

			this.ioClientSocket.on(type, data => {
				callback(data);
			});
		}
		else {
			throw new Error('invalid arguments count');
		}
	}

	removeListener(eventName, handler) {
		this.ioClientSocket.removeListener(eventName, handler);
	}

	/**
	 * ストリームを切断します
	 */
	disconnect() {
		this.ioClientSocket.disconnect();
	}

	/**
	 * ストリーム切断時のイベントハンドラを登録します
	 */
	onDisconnect(callback) {
		this.ioClientSocket.on('disconnect', callback);
	}
}

module.exports = ClientStreamingManager;
