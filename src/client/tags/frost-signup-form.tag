<frost-signup-form>
	<h4>アカウント作成</h4><!-- Sign up -->
	<div show={ isShowModal }>
		<form onsubmit={ submit }>
			<label for='signup-screen-name-box'>ユーザー名 *</label><!-- Screen name -->
			<input ref='screenName'　id='signup-screen-name-box' type='text' placeholder='example: frost_abc' style='width: 100%' pattern='^[a-zA-Z0-9_-]+$' minlength='4' maxlength='15' required />
			<label for='signup-password-box'>パスワード *</label><!-- Password -->
			<input ref='password' id='signup-password-box' type='password' style='width: 100%' pattern='^[!-~]+$' minlength='6' required />
			<label for='name-box'>名前</label><!-- Name -->
			<input ref='name' id='name-box' type='text' placeholder='froster' style='width: 100%' maxlength='32' />
			<label for='description-box'>プロフィール</label><!-- Profile -->
			<input ref='description' id='description-box' type='text' style='width: 100%' maxlength='256' />
			<label for='recaptcha-signup'>reCAPTCHA</label>
			<div id='recaptcha-signup'></div>
			<button class='button-primary'>アカウント作成</button><!-- Sign up -->
		</form>
	</div>
	<button class='button orange-button' onclick={ showModal }>{ isShowModal ? '折りたたむ -' : '展開する +' }</button>

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
				_csrf: this.csrf,
				recaptchaToken: grecaptcha.getResponse()
			}).then(() => {
				location.reload();
			}).catch((reason) => {
				console.log('Sign up error: ' + reason);
			});
		}

		this.on('mount', () => {
			grecaptcha.render('recaptcha-signup', {
				sitekey: this.siteKey
			});
		});

		this.on('unmount', () => {
			// reCAPTCHAから生成される要素を削除
			document.querySelector('.g-recaptcha-bubble-arrow').parentNode.remove();
		});
	</script>
</frost-signup-form>
