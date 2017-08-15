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

		const centralAddApplicationHandler = data => {
			this.applications.push(data.application);
			this.update();
		};

		const restHandler = rest => {
			if (rest.request.method == 'get' && rest.request.endpoint == '/applications') {
				if (rest.response.applications == null) {
					if (rest.statusCode == 204) {
						rest.response.applications = [];
					}
					else {
						return alert(`api error: failed to fetch list of appliations. ${rest.response.message}`);
					}
				}
				this.applications = rest.response.applications;
				this.update();
			}
		};

		this.on('mount', () => {
			this.central.on('add-application', centralAddApplicationHandler);
			this.webSocket.on('rest', restHandler);

			this.webSocket.sendEvent('rest', {request: {
				method: 'get', endpoint: '/applications',
				headers: {'x-api-version': 1.0},
			}});
		});

		this.on('unmount', () => {
			this.central.off('add-application', centralAddApplicationHandler);
			this.webSocket.off('rest', restHandler);
		});
	</script>
</frost-applications>
