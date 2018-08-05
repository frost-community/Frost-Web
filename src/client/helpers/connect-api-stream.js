const WebSocketEvents = require('./web-socket-events');
const fetchJson = require('./fetch-json');

module.exports = async (config, csrfToken) => {
	const secure = location.protocol == 'https:';
	try {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken == null) {
			throw new Error('accessToken がありません');
		}
		const webSocket = await WebSocketEvents.connect(`${secure ? 'wss' : 'ws'}://${config.apiHost}?access_token=${accessToken}`);
		webSocket.addEventListener('close', (ev) => { console.log('close:', ev); });
		webSocket.addEventListener('error', (ev) => { console.log('error:', ev); });
		WebSocketEvents.init(webSocket);
		return webSocket;
	}
	catch (err) {
		alert('WebSocketの接続に失敗しました');
		console.log(err);
		// logout as a precaution
		await fetchJson('DELETE', '/session', {
			_csrf: csrfToken
		});
		localStorage.removeItem('accessToken');
		location.reload();
		return;
	}
};
