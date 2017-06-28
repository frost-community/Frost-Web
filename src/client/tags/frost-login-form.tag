<frost-login-form>
	<h3>Login</h3>
	<form onsubmit={ submit }>
		<label for='screen-name-box'>Username *</label>
		<input id='screen-name-box' type='text' placeholder='example: frost_abc' style='width: 100%' pattern='^[a-zA-Z0-9_-]+$' minlength='4' maxlength='15' required />
		<label for='password-box'>Password *</label>
		<input id='password-box' type='password' style='width: 100%' pattern='^[!-~]+$' minlength='6' required />
		<button class='button-primary'>Login</button>
	</form>
	<script>
		const fetchJson = require('../helpers/fetch-json');

		submit(e) {
			e.preventDefault();

			fetchJson('POST', '/session', {
				screenName: document.querySelector('frost-login-form .screen-name-box').value,
				password: document.querySelector('frost-login-form .password-box').value,
				_csrf: document.getElementsByName('_csrf').item(0).content
			}).then((res) => {
				location.reload();
			})
			.catch(reason => {
				console.log('Sign in error: ' + reason);
			});
		}
	</script>
</frost-login-form>
