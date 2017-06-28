<frost-signup-form>
	<h3>Signup</h3>
	<div show={ isShowModal }>
		<form onsubmit={ submit }>
			<label for='screen-name-box'>Username *</label>
			<input id='screen-name-box' type='text' placeholder='example: frost_abc' style='width: 100%' pattern='^[a-zA-Z0-9_-]+$' minlength='4' maxlength='15' required />
			<label for='password-box'>Password *</label>
			<input id='password-box' type='password' style='width: 100%' pattern='^[!-~]+$' minlength='6' required />
			<label for='name-box'>Name</label>
			<input id='name-box' type='text' placeholder='froster' style='width: 100%' maxlength='32' />
			<label for='description-box'>Description</label>
			<input id='description-box' type='text' style='width: 100%' maxlength='256' />
			<label for='recaptcha'>reCAPTCHA</label>
			<div id='recaptcha'></div>
			<button class='button-primary'>Sign up</button>
		</form>
	</div>
	<button class='button orange-button' onclick={ showModal }>{ isShowModal ? '折りたたむ -' : '展開する +' }</button>
	<script>
		const fetchJson = require('../helpers/fetch-json');

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

		this.on('mount', () => {
			grecaptcha.render('recaptcha', {
				'sitekey' : this.siteKey
			});
		});
	</script>
</frost-signup-form>
