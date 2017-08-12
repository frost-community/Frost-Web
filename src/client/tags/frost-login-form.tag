<frost-login-form>
	<h3>Login</h3>
	<form onsubmit={ submit }>
		<label for='signin-screen-name-box'>Username *</label>
		<input ref='screenName' id='signin-screen-name-box' type='text' placeholder='example: frost_abc' style='width: 100%' pattern='^[a-zA-Z0-9_-]+$' minlength='4' maxlength='15' required />
		<label for='signin-password-box'>Password *</label>
		<input ref='password' id='signin-password-box' type='password' style='width: 100%' pattern='^[!-~]+$' minlength='6' required />
		<button class='button-primary'>Login</button>
	</form>
	<script>
		const fetchJson = require('../helpers/fetch-json');

		submit(e) {
			e.preventDefault();

			fetchJson('POST', '/session', {
				screenName: this.refs.screenName.value,
				password: this.refs.password.value,
				_csrf: this.csrf
			}).then((res) => {
				location.reload();
			})
			.catch(reason => {
				console.log('Sign in error: ' + reason);
			});
		}
	</script>
</frost-login-form>
