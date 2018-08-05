<frost-form-login>
	<h4>ログイン</h4><!-- Sign in -->
	<form method='post' action={ '/session' + query }>
		<input name='_csrf' type='hidden' value={ csrf } />
		<label for='signin-screen-name-box'>ユーザー名 *</label><!-- Username -->
		<input name='screenName' id='signin-screen-name-box' type='text' placeholder='example: frost_abc' style='width: 100%' pattern='^[a-zA-Z0-9_-]+$' minlength='4' maxlength='15' required />
		<label for='signin-password-box'>パスワード *</label><!-- Password -->
		<input name='password' id='signin-password-box' type='password' style='width: 100%' pattern='^[!-~]+$' minlength='6' required />
		<button class='button-primary'>ログイン</button><!-- Sign in -->
	</form>

	<style>
		@import "../styles/variables";

		:scope {
			input[type=text],
			input[type=password] {
				&:focus:invalid {
					border-color: $textbox-invalid-value-color;
				}
			}
		}
	</style>

	<script>
		const fetchJson = require('../helpers/fetch-json');
		const qs = require('qs');

		const queryContent = {};
		if (this.opts.dataRedirectType != null) {
			queryContent.redirect_type = this.opts.dataRedirectType;
		}
		if (this.redirectionQuery != null) {
			Object.assign(queryContent, this.redirectionQuery);
		}
		this.query = qs.stringify(queryContent, { addQueryPrefix: true });

		async submit(e) {
			e.preventDefault();

			try {
				const res = await fetchJson('POST', `/session${this.query}`, {
					screenName: this.refs.screenName.value,
					password: this.refs.password.value,
					_csrf: this.csrf
				})
				const json = await res.json();

				if (res.ok) {
					localStorage.setItem('accessToken', json.accessToken);
					location.reload();
					return;
				}
				else {
					alert('ログインに失敗しました: ' + json.error.message);
				}
			}
			catch (err) {
				alert('ログインに失敗しました: ' + err);
			}
		}
	</script>
</frost-form-login>
