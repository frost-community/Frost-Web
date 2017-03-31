<frost-signup-form>
	<h3>Signup</h3>
	<div show={isShowModal}>
		<form onsubmit={submit}>
			<label for="screenName">Username *</label>
			<input class="screen-name-box" type='text' name='screenName' placeholder='example: frost_abc' style="width: 100%" pattern="^[a-zA-Z0-9_-]+$" minlength="4" maxlength="15" required />
			<label for="password">Password *</label>
			<input class="password-box" type='password' name='password' style="width: 100%" pattern="^[!-~]+$" minlength="6" required />
			<label for="name">Name</label>
			<input class="name-box" type='text' name='name' placeholder='froster' style="width: 100%" maxlength="32" />
			<label for="description">Description</label>
			<input class="description-box" type='text' name='description' style="width: 100%" maxlength="256" />
			<button class="button-primary">Sign up</button>
		</form>
	</div>
	<button class="button orange-button" onclick={showModal}>アカウントを作成する</button>
	<script>
		import fetchJson from '../scripts/fetch-json';

		this.isShowModal = false;
		this.showModal = () => {
			this.isShowModal = true;
		};
		this.submit = (e) => {
			e.preventDefault();

			const screenName = document.querySelector('frost-signup-form .screen-name-box').value;
			const password = document.querySelector('frost-signup-form .password-box').value;
			const name = document.querySelector('frost-signup-form .name-box').value;
			const description = document.querySelector('frost-signup-form .description-box').value;
			const csrf = document.getElementsByName ('_csrf').item(0).content;

			fetchJson('POST', '/signup', {
				screenName: screenName,
				password: password,
				name: name,
				description: description,
				_csrf: csrf
			}).then((res) => {
				fetchJson('POST', '/signin', {
					screenName: screenName,
					password: password,
					_csrf: csrf
				}).then((res) => {
					location.reload();
				}).catch((reason) => {
					console.log('Sign in error: ' + reason);
				});
			}).catch((reason) => {
				console.log('Sign up error: ' + reason);
			});
		};
	</script>
</frost-signup-form>
