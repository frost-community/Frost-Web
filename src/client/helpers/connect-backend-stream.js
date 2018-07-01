const WebSocketEvents = require('./web-socket-events');

module.exports = async () => {
	const secure = location.protocol == 'https:';
	try {
		const webSocket = await WebSocketEvents.connect(`${secure ? 'wss' : 'ws'}://${location.host}`);
		webSocket.addEventListener('close', (ev) => { console.log('backendStream close:', ev); });
		webSocket.addEventListener('error', (ev) => { console.log('backendStream error:', ev); });
		WebSocketEvents.init(webSocket);
		return webSocket;
	}
	catch (err) {
		alert('バックエンドとの接続に失敗しました');
		console.log(err);
		return;
	}
};
