const httpServer = require('./httpServer');
const streamingServer = require('./streamingServer');
const ReconnectingWebSocket = require('./helpers/reconnecting-websocket-node');
const events = require('websocket-events');
const StreamingRest = require('./helpers/streaming-rest');
const loadConfig = require('./helpers/load-config');
const MongoAdapter = require('./helpers/MongoAdapter');
const OAuthServer = require('./oauth-server');
const passport = require('passport');
const { Strategy : LocalStrategy } = require('passport-local');
const HttpServerError = require('./helpers/http-server-error');
const validateCredential = require('./helpers/validate-credential');

process.on('unhandledRejection', err => console.log(err)); // † Last Stand † (Promise)
Error.stackTraceLimit = 20;

/**
 * Webアプリケーションサーバ
 */
module.exports = async () => {
	const log = (...args) => {
		console.log(...args);
	};
	try {
		log('+------------------+');
		log('| Frost-Web Server |');
		log('+------------------+');

		log('loading config file...');
		let config = loadConfig();
		if (config == null) {
			log('config file is not found. please refer to .configs/README.md');
			return;
		}

		log('connecting database ...');
		const db = await MongoAdapter.connect(
			config.database.host,
			config.database.database,
			config.database.username,
			config.database.password);

		log('connecting to streaming api as host ...');
		const hostApiConnection = await ReconnectingWebSocket.connect(`ws://${config.apiHost}?access_token=${config.hostAccessToken}`);
		hostApiConnection.on('error', err => {
			if (err.message.indexOf('ECONNRESET') != -1) {
				return;
			}
			log('host apiConnection error:', err);
		});
		events(hostApiConnection);
		const streamingRest = new StreamingRest(hostApiConnection);

		log('starting OAuth server ...');
		const oAuthServer = new OAuthServer(db, streamingRest);
		oAuthServer.initialize();

		log('starting http server ...');
		// NOTE: 通常のログイン認証向け
		passport.use('login', new LocalStrategy(
			{ usernameField: 'screenName', passReqToCallback: true },
			async (req, screenName, password, done) => {
				try {
					// validate user credential
					const user = await validateCredential(screenName, password, streamingRest);

					done(null, user);
				}
				catch (err) {
					req.flash('error', err.message);
					done(err);
				}
			}
		));
		// NOTE: セッションとユーザー情報を関連付けるために必要
		passport.serializeUser((user, done) => {
			done(null, user.id);
		});
		passport.deserializeUser(async (id, done) => {
			try {
				const userResult = await streamingRest.request('get', `/users/${id}`);
				if (userResult.statusCode != 200) {
					throw new HttpServerError(userResult.statusCode, userResult.response.message);
				}

				done(null, userResult.response.user);
			}
			catch (err) {
				done(err);
			}
		});
		const { http, sessionStore } = await httpServer(db, streamingRest, oAuthServer, config);

		log('starting streaming server ...');
		streamingServer(http, sessionStore, config);

		log('initialized');
	}
	catch (err) {
		log('unprocessed error:', err); // † Last Stand †
	}
};
