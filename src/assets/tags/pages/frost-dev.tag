<frost-dev>
	<div class='container'>
		<header>
			<h3>Frost Developers Center</h3>
		</header>
		<main>
			<div class='row' style='margin-top: 10%'>
				<div class='ten columns offset-by-one'>
					<h4>Your Applications</h4>
					<ul if={applications.length != 0}>
						<li each={applications} style='list-style-type: none;'>
							<div class='box'>
								<p>App name: {name}</p>
								<p>Description: {description}</p>
								<p>App Id: {id}</p>
								<p>Permissions:</p>
								<ul>
								<li each={permission ,i in permissions}>
									{permission}
								</li>
								</ul>
							</div>
						</li>
					</ul>
					<p if={applications.length == 0}>You don't have any applications.</p>
				</div>
			</div>
			<div class='row' style='margin-top: 10%'>
				<frost-create-application-form />
			</div>
		</main>

		<frost-footer />
	</div>
	<script>
		import fetchJson from '../../scripts/fetch-json';

		this.applications = [];
		fetchJson('POST', '/api', {method: 'get', endpoint: '/applications', headers: {'x-api-version': 1.0}, _csrf: document.getElementsByName('_csrf').item(0).content}).then(res => {
			return res.json();
		}).then(json => {
			if (json.applications == null) {
				if (json.message == 'applications are empty') {
					json.applications = [];
				}
				else {
					return alert(`error: faild to fetch list of appliations. ${json.message}`);
				}
			}

			for(const application of json.applications)
				this.applications.push(application);

			this.update();
		}).catch((reason) => {
			alert('error: faild to fetch list of appliations. ' + reason);
		});
	</script>
</frost-dev>
