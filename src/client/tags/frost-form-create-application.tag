<frost-form-create-application>
	<button class='orange-button' onclick={ showModal }>連携アプリケーションを作成する { isShowModal ? '－' : '＋' }</button><!-- Create an application -->
	<form onsubmit={ submit } show={ isShowModal }>
		<label for='application-name'>連携アプリケーション名 *</label><!-- Application name -->
		<input ref='name' class='name-box' type='text' id='application-name' name='name' placeholder='example: Frost Client' style='width: 100%' maxlength='32' required />
		<label for='application-description'>説明</label><!-- Description -->
		<textarea ref='description' class='description-box' id='application-description' name='description' rows='3' style='width: 100%' maxlength='256' />
		<fieldset class='scopes'>
			<label>権限(Scopes)</label><!-- Permissions(Scopes) -->
			<label for='scopes-user-read'>
				<input type='checkbox' id='scopes-user-read' name='scopes' value='user.read'>user.read - ユーザーに関する読み取り</input><!-- user.read - Reading about users -->
			</label>
			<label for='scopes-user-write'>
				<input type='checkbox' id='scopes-user-write' name='scopes' value='user.write'>user.write - ユーザーに関する書き換え</input><!-- user.write - Writing about users -->
			</label>
			<label for='scopes-post.read'>
				<input type='checkbox' id='scopes-post.read' name='scopes' value='post.read'>post.read - ポストに関する読み取り</input><!-- post.read - Reading about posts -->
			</label>
			<label for='scopes-post-write'>
				<input type='checkbox' id='scopes-post-write' name='scopes' value='post.write'>post.write - ポストに関する書き換え</input><!-- post.write - Writing about posts -->
			</label>
			<label for='scopes-user-account-read'>
				<input type='checkbox' id='scopes-user-account-read' name='scopes' value='user.account.read'>user.account.read - アカウントに関する読み取り</input><!-- user.account.read - Reading about your account -->
			</label>
			<label for='scopes-user-account-write'>
				<input type='checkbox' id='scopes-user-account-write' name='scopes' value='user.account.write'>user.account.write - アカウントに関する書き換え</input><!-- user.account.write - Writing about your account -->
			</label>
			<label for='scopes-app-read'>
				<input type='checkbox' id='scopes-app-read' name='scopes' value='app.read'>app.read - 所持する連携アプリケーションに関する読み取り</input><!-- app.read - Reading about your applications -->
			</label>
			<label for='scopes-app-write'>
				<input type='checkbox' id='scopes-app-write' name='scopes' value='app.write'>app.write - 所持する連携アプリケーションに関する書き換え</input><!-- app.write - Writing about your applications -->
			</label>
			<label for='scopes-storage-read'>
				<input type='checkbox' id='scopes-storage-read' name='scopes' value='storage.read'>storage.read - Frostストレージに関する読み取り</input><!-- storage.read - Reading about Frost Storage -->
			</label>
			<label for='scopes-storage-write'>
				<input type='checkbox' id='scopes-storage-write' name='scopes' value='storage.write'>storage.write - Frostストレージに関する書き換え</input><!-- storage.write - Writing about Frost Storage -->
			</label>
		</fieldset>
		<div id='recaptcha-create-application'></div>
		<button class='button-primary'>作成する</button><!-- Create -->
	</form>

	<script>
		this.isShowModal = false;
		let widgetId;

		this.showModal = () => {
			this.isShowModal = !this.isShowModal;
		};

		this.on('mount', () => {
			this.submit = (ev) => {
				ev.preventDefault();

				const scopes = [];
				for (let scope of document.querySelectorAll('frost-form-create-application .scopes *')) {
					if (scope.checked) {
						scopes.push(scope.value);
					}
				}

				this.backendStream.on('app-create', (result) => {
					console.log('app-create result:', result);
					if (result.app != null) {
						this.central.trigger('add-application', { application: result.app });
						alert('created application.');
					}
					else {
						alert(`error: failed to create application. ${result.message}`);
					}
					grecaptcha.reset(widgetId);
				});
				this.backendStream.sendEvent('app-create', {
					recaptchaToken: grecaptcha.getResponse(),
					body: {
						name: this.refs.name.value,
						description: this.refs.description.value,
						scopes: scopes
					}
				});
			};

			widgetId = grecaptcha.render('recaptcha-create-application', {
				sitekey: this.siteKey
			});
		});

		this.on('unmount', () => {
			// reCAPTCHAから生成される要素を削除
			document.querySelector('.g-recaptcha-bubble-arrow').parentNode.remove();
		});
	</script>
</frost-form-create-application>
