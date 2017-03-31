<frost-login-form>
	<h3>Login</h3>
	<form onsubmit={submit}>
		<label for="screenName">Username *</label>
		<input class="screen-name-box" type='text' name='screenName' placeholder='example: frost_abc' style="width: 100%" pattern="^[a-zA-Z0-9_-]+$" minlength="4" maxlength="15" required />
		<label for="password">Password *</label>
		<input class="password-box" type='password' name='password' style="width: 100%" pattern="^[!-~]+$" minlength="6" required />
		<button class="button-primary">Login</button>
		<input type='hidden' name='_csrf' value={token} />
	</form>
	<script>
		import fetchJson from '../scripts/fetch-json';
		this.token = document.getElementsByName('_csrf').item(0).content;

		this.submit = (e) => {
			e.preventDefault();

			fetchJson('POST', '/signin', {
				screenName: document.querySelector('frost-login-form .screen-name-box').value,
				password: document.querySelector('frost-login-form .password-box').value,
				_csrf: this.token
			}).then((res) => {
				location.reload();
			});
		};
	</script>
</frost-login-form>
