<frost-signup-form>
	<h3>Signup</h3>
	<div show={isShowModal}>
		<form method="post" action="/signup" onsubmit={submit}>
			<label for="screenName">Username *</label>
			<input class="screen-name-box" type='text' name='screenName' placeholder='example: frost_abc' style="width: 100%" pattern="^[a-zA-Z0-9_-]+$" minlength="4" maxlength="15" required />
			<label for="password">Password *</label>
			<input class="password-box" type='password' name='password' style="width: 100%" pattern="^[!-~]+$" minlength="6" required />
			<label for="name">Name</label>
			<input class="name-box" type='text' name='name' placeholder='froster' style="width: 100%" maxlength="32" />
			<label for="description">Description</label>
			<input class="description-box" type='text' name='description' style="width: 100%" maxlength="256" />
			<input class="button-primary" value="Sign up" />
			<input type='hidden' name='_csrf' value={token} />
		</form>
	</div>
	<button class="button orange-button" onclick={showModal}>アカウントを作成する</button>
	<script>
		import fetchJson from '../scripts/fetch-json';

		this.token = document.getElementsByName ('_csrf').item(0).content;
		this.isShowModal = false;
		this.showModal = () => {
			this.isShowModal = true;
		};
		this.submit = (e) => {
			e.preventDefault();

			fetchJson('POST', '/signup', {
				screenName: document.querySelector('frost-signup-form .screen-name-box').value,
				password: document.querySelector('frost-signup-form .password-box').value,
				name: document.querySelector('frost-signup-form .name-box').value,
				description: document.querySelector('frost-signup-form .description-box').value,
				_csrf: this.token
			}).then((res) => {
				location.reload();
			});
		};
	</script>
</frost-signup-form>
