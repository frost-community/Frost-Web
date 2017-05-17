<frost-login-form>
	<h3>Login</h3>
	<form onsubmit={ submit }>
		<label for='screenName'>Username *</label>
		<input class='screen-name-box' type='text' name='screenName' placeholder='example: frost_abc' style='width: 100%' pattern='^[a-zA-Z0-9_-]+$' minlength='4' maxlength='15' required />
		<label for='password'>Password *</label>
		<input class='password-box' type='password' name='password' style='width: 100%' pattern='^[!-~]+$' minlength='6' required />
		<button class='button-primary'>Login</button>
	</form>
	<script>
		import fetchJson from '../scripts/fetch-json';

		this.submit = (e) => {
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
		};
	</script>
</frost-login-form>
