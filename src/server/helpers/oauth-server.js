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
				debug('failed to fetch secret.', secretResult.statusCode, secretResult.response.message);
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

	build() {
		this._server = oauth2orize.createServer();

		this._server.serializeClient((client, done) => {
			debug('クライアントをシリアライズ');
			done(null, client.id);
		});
		this._server.deserializeClient(async (id, done) => {
			try {
				const client = await this._fetchClient(id, true);

				debug('クライアントをデシリアライズ');
				done(null, client);
			}
			catch (err) {
				debug('クライアントのデシリアライズに失敗');
				done(err);
			}
		});
		// 認可コードの発行時
		this._server.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, done) => {
			try {
				const code = await this._generateCode(client.id, user.id, redirectUri, ares.scope);
				debug('コードの登録に成功');
				done(null, code.value);
			}
			catch (err) {
				debug('コード登録時にエラーが発生');
				done(err);
			}
		}));
		// 認可コードとトークンの交換時
		this._server.exchange(oauth2orize.exchange.code(async (client, codeValue, redirectUri, done) => {
			try {
				const code = await this._fetchCode(codeValue);
				if (code == null || code.clientId !== client.id || redirectUri !== code.redirectUri) {
					debug('コード、クライアント、リダイレクトURLのいずれかが不正');
					return done(null, false);
				}

				await this._removeCode(codeValue);
				debug('コードを削除');

				let token = await this._fetchToken(code.clientId, code.userId, code.scopes);
				if (token == null) {
					token = await this._generateToken(code.clientId, code.userId, code.scopes);
					debug('トークンの登録に成功');
				}
				debug('コードとトークンの交換に成功');
				done(null, token.accessToken, null);
			}
			catch (err) {
				debug('コードとトークンの交換時にエラーが発生');
				done(err);
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

	authorizeMiddle() {
		return this._server.authorization(async (clientId, redirectUri, scopes, validated) => {
			try {
				const client = await this._fetchClient(clientId, true);

				// NOTE: scopeが何も指定されないとなぜか空文字列が渡されてくるので空配列に直す
				if (scopes == null || scopes == '') scopes = [];

				const validScopes = scopes.every(scope => client.scopes.indexOf(scope) != -1);
				if (!validScopes) {
					debug('要求スコープが不正なため認可要求を取り下げ');
					throw new Error('scope invalid');
				}

				// TODO: redirectUriを検証

				debug('認可要求の検証に成功');
				validated(null, client, redirectUri);
			}
			catch (err) {
				debug('認可要求の検証でエラーが発生');
				validated(err);
			}
		}, async (client, user, scopes, immediated) => {
			try {
				const token = await this._fetchToken(client.id, user.id, client.scopes); // TODO: scopes
				if (token != null) {
					debug('即時に認可');
					return immediated(null, true);
				}
				debug('認可フォームを表示');
				immediated(null, false);
			}
			catch (err) {
				debug('即時認可の判定でエラーが発生');
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
