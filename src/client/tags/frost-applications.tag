<frost-applications>
	<ul if={ applications.length != 0 }>
		<li each={ applications } style='list-style-type: none;'>
			<div class='box'>
				<p>App name: { name }</p>
				<p>Description: { description }</p>
				<p>App Id: { id }</p>
				<p>Permissions:</p>
				<ul>
				<li each={ permission ,i in permissions }>
					{ permission }
				</li>
				</ul>
			</div>
		</li>
	</ul>
	<p if={ applications.length == 0 }>You don't have any applications.</p>
	<script>
		this.applications = [];

		this.obs.on('add-application', (data) => {
			this.applications.push(data.application);
			this.update();
		});

		this.on('mount', () => {
			this.webSocket.sendEvent('rest', {request: {
				method: 'get', endpoint: '/applications',
				headers: {'x-api-version': 1.0},
			}});

			this.webSocket.addEventListener('rest', event => {
				const data = event.data;
				if (data.request.method == 'get' && data.request.endpoint == '/applications') {
					if (data.response.applications == null) {
						if (data.response.message == 'applications are empty') {
							data.response.applications = [];
						}
						else {
							return alert(`api error: faild to fetch list of appliations. ${data.response.message}`);
						}
					}
					this.applications = data.response.applications;
					this.update();
				}
			});
		});
	</script>
</frost-applications>
