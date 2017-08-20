<frost-applications>
	<ul if={ applications.length != 0 }>
		<li each={ applications } style='list-style-type: none;'>
			<div class='box'>
				<p>アプリケーション名: { name }</p>
				<p>説明: { description }</p>
				<p>アプリケーションID: { id }</p>
				<p>権限:</p><!-- Permissions -->
				<ul>
					<li each={ permission ,i in permissions }>
						{ permission }
					</li>
				</ul>
			</div>
		</li>
	</ul>
	<p if={ applications.length == 0 }>あなたはアプリケーションを持っていません。</p><!-- You don't have any applications -->

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

				this.webSocket.off('rest', restHandler);
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
		});
	</script>
</frost-applications>
