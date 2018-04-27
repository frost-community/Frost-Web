const oauth2orize = require('oauth2orize');
const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const { Strategy : ClientPasswordStrategy } = require('passport-oauth2-client-password');
const uid = require('uid2');

const debug = (...args) => { console.log('[OAuth]', ...args); };

class OAuthServer {
	constructor(db, streamingRest) {
		this._db = db;
		this._streamingRest = streamingRest;
	}

	async _fetchClient(id, throwError) {
		const appResult = await this._streamingRest.request('get', `/applications/${id}`);
		if (appResult.statusCode != 200) {
			if (throwError)
				throw new Error('invalid client id');
			else
				return null;
		}
		const app = appResult.response.application;

		const secretResult = await this._streamingRest.request('get', `/applications/${id}/secret`);
		if (secretResult.statusCode != 200) {
			if (secretResult.statusCode == 400) {
				if (throwError)
					throw new Error(secretResult.response.message);
				else
					return null;
			}
			else {
				debug('failed to fetch secret.', secretResult.statusCode, secretResult.response.message);
				throw new Error('failed to fetch secret');
			}
		}
		app.secret = secretResult.response.secret;
	}

	build() {
		this._server = oauth2orize.createServer();

		this._server.serializeClient((client, callback) => {
			debug('クライアントをシリアライズ');
			callback(null, client.id);
		});
		this._server.deserializeClient(async (id, callback) => {
			try {
				const client = await this._fetchClient(id, true);

				debug('クライアントをデシリアライズ');
				callback(null, client);
			}
			catch (err) {
				debug('クライアントのデシリアライズに失敗');
				callback(err);
			}
		});
		this._server.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, callback) => {
			try {
				const code = await this._db.create('oauth2.codes', {
					value: uid(16),
					redirectUri: redirectUri,
					clientId: client._id,
					userId: user._id
				});
				debug('コードの登録に成功');
				callback(null, code.value);
			}
			catch (err) {
				debug('コード登録時にエラーが発生');
				callback(err);
			}
		}));
		this._server.exchange(oauth2orize.exchange.code(async (client, code, redirectUri, callback) => {
			try {
				const authCode = await this._db.find('oauth2.codes', { value: code });

				if (authCode == null || !authCode.clientId.equals(client.id) || redirectUri !== authCode.redirectUri) {
					debug('コード、クライアント、リダイレクトURLのいずれかが不正');
					return callback(null, false);
				}

				await this._db.remove('oauth2.codes', { value: code });
				debug('コードを削除');

				const tokenResult = await this._streamingRest.request('get', '/auth/tokens', { query: {
					applicationId: authCode.clientId,
					userId: authCode.userId,
					scopes: authCode.scopes.join(',')
				}});
				if (tokenResult.statusCode != 200 && tokenResult.statusCode != 400) {
					// TODO: error
				}
				let token = tokenResult.response.token;

				if (token == null) {
					const generateTokenResult = await this._streamingRest.request('post', '/auth/tokens', { body: {
						applicationId: authCode.clientId,
						userId: authCode.userId,
						scopes: authCode.scopes
					}});
					if (generateTokenResult.statusCode != 200) {
						// TODO: error
					}
					token = generateTokenResult.response.token;
					debug('トークンの登録に成功');
				}
				debug('コードとトークンの交換に成功');
				callback(null, token.accessToken, null);
			}
			catch (err) {
				debug('コードとトークンの交換時にエラーが発生');
				callback(err);
			}
		}));
	}

	defineStrategies() {
		const verifyClient = async (clientId, secret, done) => {
			try {
				const client = await this._fetchClient(clientId, false);
				if (client == null || secret !== client.secret) {
					debug('クライアントの認証に失敗');
					return done(null, false);
				}
				debug('クライアントの認証に成功');
				done(null, client);
			}
			catch (err) {
				debug('クライアントの認証時にエラーが発生');
				done(err);
			}
		};
		passport.use('clientBasic', new BasicStrategy(verifyClient));
		passport.use('clientPassword', new ClientPasswordStrategy(verifyClient));
	}
}
module.exports = OAuthServer;
