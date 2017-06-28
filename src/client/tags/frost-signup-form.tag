<frost-signup-form>
	<h3>Signup</h3>
	<div show={ isShowModal }>
		<form onsubmit={ submit }>
			<label for='signup-screen-name-box'>Username *</label>
			<input ref='screenName'　id='signup-screen-name-box' type='text' placeholder='example: frost_abc' style='width: 100%' pattern='^[a-zA-Z0-9_-]+$' minlength='4' maxlength='15' required />
			<label for='signup-password-box'>Password *</label>
			<input ref='password' id='signup-password-box' type='password' style='width: 100%' pattern='^[!-~]+$' minlength='6' required />
			<label for='name-box'>Name</label>
			<input ref='name' id='name-box' type='text' placeholder='froster' style='width: 100%' maxlength='32' />
			<label for='description-box'>Description</label>
			<input ref='description' id='description-box' type='text' style='width: 100%' maxlength='256' />
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
				screenName: this.refs.screenName.value,
				password: this.refs.password.value,
				name: this.refs.name.value,
				description: this.refs.description.value,
				_csrf: this.csrfToken,
				recaptchaToken: grecaptcha.getResponse()
			}).then(() => {
				location.reload();
			}).catch((reason) => {
				console.log('Sign up error: ' + reason);
			});
		}

		this.on('mount', () => {
			grecaptcha.render('recaptcha', {
				sitekey: this.siteKey
			});
		});
	</script>
</frost-signup-form>
