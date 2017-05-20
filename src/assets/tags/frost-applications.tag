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
		const socket = opts.socket;

		this.applications = [];

		socket.on('ready', () => {
			socket.emit('rest', {request: {
				method: 'get', endpoint: '/applications',
				headers: {'x-api-version': 1.0},
			}});
		});

		socket.on('rest', (data) => {
			if (data.request.endpoint == '/applications') {
				if (data.posts != null) {
					this.timelinePosts = data.posts;
					this.timelinePosts.reverse();
					this.update();

					socket.emit('timeline-connect', {type: 'public'});
				}

				if (data.applications == null) {
					if (data.message == 'applications are empty') {
						data.applications = [];
					}
					else {
						return alert(`error: faild to fetch list of appliations. ${data.message}`);
					}
				}

				this.applications = data.applications;
				this.update();
			}
		});

		socket.on('success', (data) => {
			console.log('success: ' + data.message);
		});

		socket.on('error', (data) => {
			console.log('error: ' + data.message);
		});

	</script>
</frost-applications>
