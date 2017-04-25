<frost-dev>
	<div class='container'>
		<header>
			<h3>Frost Developers Center</h3>
		</header>
		<main>
			<div class='row' style='margin-top: 10%'>
				<frost-create-application-form />
			</div>
		</main>

		<frost-footer />
	</div>
</frost-dev>

<frost-create-application-form>
	<div class="ten columns offset-by-one box">
		<h4>Create your applicaiton</h4>
		<div show={isShowModal}>
			<form onsubmit={submit}>
				<label for='application-name'>Name *</label>
				<input class='name-box' type='text' id='application-name' name='name' placeholder='example: Frost Client' style='width: 100%' maxlength='32' required />
				<label for='application-description'>Description</label>
				<textarea class='description-box' id='application-description' name='description' rows='3' style='width: 100%' maxlength='256' />
				<fieldset class='permissions'>
					<label>Permissions</label>
					<label for='permissions-userRead'>
						<input type='checkbox' id='permissions-userRead' name='permissions' value='userRead'>userRead - Read about users</input>
					</label>
					<label for='permissions-userWrite'>
						<input type='checkbox' id='permissions-userWrite' name='permissions' value='userWrite'>userWrite - Write about users</input>
					</label>
					<label for='permissions-postRead'>
						<input type='checkbox' id='permissions-postRead' name='permissions' value='postRead'>postRead - Read about posts</input>
					</label>
					<label for='permissions-postWrite'>
						<input type='checkbox' id='permissions-postWrite' name='permissions' value='postWrite'>postWrite - Write about posts</input>
					</label>
					<label for='permissions-accountRead'>
						<input type='checkbox' id='permissions-accountRead' name='permissions' value='accountRead'>accountRead - Read about your account</input>
					</label>
					<label for='permissions-accountWrite'>
						<input type='checkbox' id='permissions-accountWrite' name='permissions' value='accountWrite'>accountWrite - Write about your account</input>
					</label>
					<label for='permissions-application'>
						<input type='checkbox' id='permissions-application' name='permissions' value='application'>application - Accessing about your applications</input>
					</label>
				</fieldset>
				<div class="g-recaptcha" data-sitekey={siteKey}></div>
				<button class='button-primary'>Create application</button>
			</form>
		</div>
		<button class="button orange-button" onclick={showModal}>フォーム表示切り替え</button>
	</div>
	<script>
		import fetchJson from '../../scripts/fetch-json';

		this.siteKey = document.getElementsByName('siteKey').item(0).content;

		this.isShowModal = false;
		this.showModal = () => {
			this.isShowModal = !this.isShowModal;
		};
		this.submit = (e) => {
			e.preventDefault();

			const permissions = [];
			for(let permission of document.querySelectorAll('frost-create-application .permissions *')) {
				if (permission.checked) {
					permissions.push(permission.value);
				}
			}

			fetchJson('POST', '/applications', {
				name: document.querySelector('frost-create-application .name-box').value,
				description: document.querySelector('frost-create-application .description-box').value,
				permissions: permissions,
				_csrf: document.getElementsByName('_csrf').item(0).content,
				recaptchaToken: grecaptcha.getResponse()
			}).then((res) => {
				return res.json();
			}).then((res) => {
				if (res.statusCode == 200) {
					alert('created application.');
				}
				else {
					alert('creation error: ' + res.message);
				}
			}).catch((reason) => {
				console.log('response error: ' + reason);
			});
		};
	</script>
</frost-create-application-form>
