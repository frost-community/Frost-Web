<frost-dev>
	<div class='container'>
		<header>
			<h3>Frost Developers Center</h3>
		</header>
		<main>
			<div class='row' style='margin-top: 10%'>
				<frost-create-application />
			</div>
		</main>

		<frost-footer />
	</div>
</frost-dev>

<frost-create-application>
	<div class="box">
		<h4>Create your applicaiton</h4>
		<form onsubmit={submit}>
			<label for='application-name'>Name *</label>
			<input class='name-box' type='text' id='application-name' name='name' placeholder='example: Frost Client' style='width: 100%' maxlength='32' required />
			<label for='application-description'>Description</label>
			<textarea class='description-box' id='application-description' name='description' rows='3' style='width: 100%' maxlength='256' />
			<fieldset>
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
			<button class='button-primary'>Create application</button>
		</form>
	</div>
</frost-create-application>
