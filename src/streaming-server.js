'use strict';

const ioServer = require('socket.io');
const ioClient = require('socket.io-client');
const getSessionFromCookieAsync = require('./helpers/get-session-from-cookie-async');
const ClientStreamingManager = require('./helpers/client-streaming-manager');
const ServerStreamingManager = require('./helpers/server-streaming-manager');
const StreamingProxy = require('./helpers/streaming-proxy');

/**
 * Webクライアントのストリーミング接続をサポートします。
 * セッション経由でAPIにアクセスできる機能が含まれます。
 */
module.exports = (http, sessionStore, config) => {
	const ioServerToFront = ioServer(http);

	ioServerToFront.sockets.on('connection', ioServerToFrontSocket => {
		(async () => {
			const frontManager = new ServerStreamingManager(ioServerToFront, ioServerToFrontSocket);

			// セッションからaccessKeyを取得
			const session = await getSessionFromCookieAsync(ioServerToFrontSocket.request.headers.cookie, config.web.session.name, config.web.session.SecretToken, sessionStore);

			const apiManager = new ClientStreamingManager(ioClient(config.web.apiBaseUrl, {
				query: {
					applicationKey: config.web.applicationKey,
					accessKey: session.accessKey
				}
			}));

			// 接続されるまで待機
			await apiManager.waitConnectAsync();

			apiManager.onDisconnect(() => {
				frontManager.disconnect();
				console.log('api disconnect');
			});

			// 認証チェック
			if ((await apiManager.waitEventAsync('authorization')).success === false) {
				console.log('failure authorization');
				return;
			}

			const streamingProxy = new StreamingProxy(frontManager, apiManager, false, config);
			streamingProxy.start();

			const userId = session.accessKey.split('-')[0];
			frontManager.stream('ready', {userId: userId});
		})();
	});
};
