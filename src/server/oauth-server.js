const oauth2orize = require('oauth2orize');
const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const { Strategy : ClientPasswordStrategy } = require('passport-oauth2-client-password');
const uid = require('uid2');

class OAuthServer {
	constructor(db, streamingRest, isDebug) {
		this._db = db;
		this._streamingRest = streamingRest;
		this._isDebug = isDebug;
	}

	_log(...args) {
		console.log('[oauth server]', ...args);
	}

	_debugLog(...args) {
		if (this._isDebug) {
			this._log(...args);
		}
	}

	async _fetchClient(id, throwError) {
		const appResult = await this._streamingRest.request('get', `/applications/${id}`);
		if (appResult.statusCode != 200) {
			if (throwError)
				throw new Error('invalid client_id');
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
				this._debugLog('failed to fetch secret.', secretResult.statusCode, secretResult.response.message);
				throw new Error('failed to fetch secret');
			}
		}
		app.secret = secretResult.response.secret;

		return app;
	}

	async _fetchToken(clientId, userId, scopes) {
		scopes = scopes || [];

		const tokenResult = await this._streamingRest.request('get', '/auth/tokens', { query: {
			applicationId: clientId,
			userId: userId,
			scopes: scopes.join(',')
		}});
		if (tokenResult.statusCode != 200 && tokenResult.statusCode != 404) {
			throw new Error(tokenResult.response.message);
		}

		return tokenResult.response.token;
	}

	async _generateToken(clientId, userId, scopes) {
		scopes = scopes || [];

		const generateTokenResult = await this._streamingRest.request('post', '/auth/tokens', { body: {
			applicationId: clientId,
			userId: userId,
			scopes: scopes
		}});
		if (generateTokenResult.statusCode != 200) {
			throw new Error(generateTokenResult.response.message);
		}

		return generateTokenResult.response.token;
	}

	_fetchCode(codeValue) {
		return this._db.find('oauth2.codes', { value: codeValue });
	}

	_generateCode(clientId, userId, redirectUri, scopes) {
		scopes = scopes || [];

		return this._db.create('oauth2.codes', {
			value: uid(16),
			redirectUri: redirectUri,
			clientId: clientId,
			userId: userId,
			scopes: scopes
		});
	}

	_removeCode(codeValue) {
		return this._db.remove('oauth2.codes', { value: codeValue });
	}

	initialize() {
		this._log('building server ...');
		this.build();

		this._log('registering strategies ...');
		this.registerStrategies();

		this._log('initialized');
	}

	build() {
		this._server = oauth2orize.createServer();

		this._server.serializeClient((client, done) => {
			this._debugLog('クライアントをシリアライズ');
			done(null, client.id);
		});
		this._server.deserializeClient(async (id, done) => {
			try {
				const client = await this._fetchClient(id, true);

				this._debugLog('クライアントをデシリアライズ');
				done(null, client);
			}
			catch (err) {
				this._debugLog('クライアントのデシリアライズに失敗');
				done(err);
			}
		});
		// 認可コードの発行時
		this._server.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, areq, done) => {
			try {
				// NOTE: Resource Ownerからスコープ変更を受け付ける場合は: areq.scope -> ares.scope || areq.scope (この場合scopeの再検証は必要そう)
				const code = await this._generateCode(client.id, user.id, redirectUri, areq.scope);
				this._debugLog('コードの登録に成功');
				done(null, code.value);
			}
			catch (err) {
				this._debugLog('コード登録時にエラーが発生');
				done(err);
			}
		}));
		// 認可コードとトークンの交換時
		this._server.exchange(oauth2orize.exchange.code(async (client, codeValue, redirectUri, done) => {
			try {
				const code = await this._fetchCode(codeValue);
				if (code == null || code.clientId !== client.id || redirectUri !== code.redirectUri) {
					this._debugLog('コード、クライアント、リダイレクトURLのいずれかが不正');
					return done(null, false);
				}

				await this._removeCode(codeValue);
				this._debugLog('コードを削除');

				let token = await this._fetchToken(code.clientId, code.userId, code.scopes);
				if (token == null) {
					token = await this._generateToken(code.clientId, code.userId, code.scopes);
					this._debugLog('トークンの登録に成功');
				}
				this._debugLog('コードとトークンの交換に成功');
				done(null, token.accessToken, null);
			}
			catch (err) {
				this._debugLog('コードとトークンの交換時にエラーが発生');
				done(err);
			}
		}));
	}

	registerStrategies() {
		const verifyClient = async (clientId, secret, done) => {
			try {
				const client = await this._fetchClient(clientId, false);
				if (client == null || secret !== client.secret) {
					this._debugLog('クライアントの認証に失敗');
					return done(null, false);
				}
				this._debugLog('クライアントの認証に成功');
				done(null, client);
			}
			catch (err) {
				this._debugLog('クライアントの認証時にエラーが発生');
				done(err);
			}
		};
		passport.use('clientBasic', new BasicStrategy(verifyClient));
		passport.use('clientPassword', new ClientPasswordStrategy(verifyClient));
	}

	authorizeMiddle() {
		return this._server.authorization(async (clientId, redirectUri, scopes, validated) => {
			try {
				if (!Array.isArray(scopes)) {
					scopes = [];
				}

				const client = await this._fetchClient(clientId, true);

				const validScopes = scopes.every(scope => client.scopes.indexOf(scope) != -1);
				if (!validScopes) {
					this._debugLog('要求スコープが不正なため認可要求を取り下げ');
					throw new Error('invalid scope');
				}

				if (client.redirectUri != null && client.redirectUri != redirectUri) {
					throw new Error('invalid redirect_uri');
				}

				this._debugLog('認可要求の検証に成功');
				validated(null, client, redirectUri);
			}
			catch (err) {
				this._debugLog('認可要求の検証でエラーが発生');
				validated(err);
			}
		}, async (client, user, scopes, immediated) => {
			try {
				const token = await this._fetchToken(client.id, user.id, scopes);
				if (token != null) {
					this._debugLog('即時に認可');
					return immediated(null, true);
				}
				this._debugLog('認可フォームを表示');
				immediated(null, false);
			}
			catch (err) {
				this._debugLog('即時認可の判定でエラーが発生');
				immediated(err);
			}
		});
	}

	decisionMiddle() {
		return this._server.decision();
	}

	tokenMiddle() {
		return [
			passport.authenticate(['clientBasic', 'clientPassword'], { session: false }),
			this._server.token()
		];
	}
}
module.exports = OAuthServer;
