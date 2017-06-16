<frost-create-application-form>
	<div class='ten columns offset-by-one box'>
		<h4>Create your applicaiton</h4>
		<div show={ isShowModal }>
			<form onsubmit={ submit }>
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
				<div class='g-recaptcha' data-sitekey={ siteKey }></div>
				<button class='button-primary'>Create application</button>
			</form>
		</div>
		<button class='button orange-button' onclick={ showModal }>{ isShowModal ? '折りたたむ -' : '展開する +' }</button>
	</div>
	<script>
		this.isShowModal = false;
		showModal() {
			this.isShowModal = !this.isShowModal;
		}

		submit(e) {
			e.preventDefault();

			const permissions = [];
			for (let permission of document.querySelectorAll('frost-create-application-form .permissions *')) {
				if (permission.checked) {
					permissions.push(permission.value);
				}
			}

			this.webSocket.sendEvent('rest', {request: {
				method: 'post', endpoint: '/applications',
				headers: {'x-api-version': 1.0},
				body: {
					name: document.querySelector('frost-create-application-form .name-box').value,
					description: document.querySelector('frost-create-application-form .description-box').value,
					permissions: permissions,
					recaptchaToken: grecaptcha.getResponse()
				}
			}});
		}

		this.on('mount', () => {
			this.webSocket.addEventListener('rest', event => {
				const restData = event.data;
				if (restData.request.method == 'post' && restData.request.endpoint == '/applications') {
					if (restData.success) {
						if (restData.response.application != null) {
							this.obs.trigger('add-application', {application: restData.response.application});
							alert('created application.');
						}
						else {
							alert(`api error: faild to create application. ${restData.response.message}`);
						}
					}
					else {
						alert(`internal error: ${restData.message}`);
					}
				}
			});
		});
	</script>
</frost-create-application-form>
