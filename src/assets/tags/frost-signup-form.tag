<frost-signup-form>
	<h3>Signup</h3>
	<div show={ isShowModal }>
		<form onsubmit={ submit }>
			<label for='screenName'>Username *</label>
			<input class='screen-name-box' type='text' name='screenName' placeholder='example: frost_abc' style='width: 100%' pattern='^[a-zA-Z0-9_-]+$' minlength='4' maxlength='15' required />
			<label for='password'>Password *</label>
			<input class='password-box' type='password' name='password' style='width: 100%' pattern='^[!-~]+$' minlength='6' required />
			<label for='name'>Name</label>
			<input class='name-box' type='text' name='name' placeholder='froster' style='width: 100%' maxlength='32' />
			<label for='description'>Description</label>
			<input class='description-box' type='text' name='description' style='width: 100%' maxlength='256' />
			<div class='g-recaptcha' data-sitekey={ siteKey }></div>
			<button class='button-primary'>Sign up</button>
		</form>
	</div>
	<button class='button orange-button' onclick={ showModal }>{ isShowModal ? '折りたたむ -' : '展開する +' }</button>
	<script>
		const fetchJson = require('../scripts/fetch-json');

		this.isShowModal = false;
		showModal() {
			this.isShowModal = !this.isShowModal;
		}

		submit(e) {
			e.preventDefault();

			fetchJson('POST', '/session/register', {
				screenName: document.querySelector('frost-signup-form .screen-name-box').value,
				password: document.querySelector('frost-signup-form .password-box').value,
				name: document.querySelector('frost-signup-form .name-box').value,
				description: document.querySelector('frost-signup-form .description-box').value,
				_csrf: document.getElementsByName ('_csrf').item(0).content,
				recaptchaToken: grecaptcha.getResponse()
			}).then(() => {
				location.reload();
			}).catch((reason) => {
				console.log('Sign up error: ' + reason);
			});
		}
	</script>
</frost-signup-form>
