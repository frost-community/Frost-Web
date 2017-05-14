<frost-public-timeline>
	<div class='box' style='margin: 10px 0' each={timelinePosts}>
		<p>{user.name} @{user.screenName}</p>
		<p>{text}</p>
		<p>{ parent.moment.unix(createdAt).fromNow() }</p>
	</div>
	<script>
		import moment from 'moment';
		this.moment = moment;
		this.socket = opts.socket;

		this.timelinePosts = [];

		this.reload = () => {
			this.timelinePosts = [];

			this.socket.emit('rest', {request: {
				method: 'get', endpoint: '/general/timeline',
				headers: {'x-api-version': 1.0},
			}});

			this.socket.on('rest', (data) => {
				if (data.request.endpoint == '/general/timeline') {
					if (data.posts != null) {
						this.timelinePosts = data.posts;
						this.timelinePosts.reverse();
						this.update();

						this.socket.emit('timeline-connect', {type: 'public'});
					}
				}
			});

			this.socket.on('data:public:status', (statusData) => {
				console.log('status: ' + statusData);
				this.timelinePosts.splice(0, 0, statusData);
				this.update();
			});

			this.socket.on('success', (data) => {
				console.log('success: ' + data.message);
			});

			this.socket.on('error', (data) => {
				console.log('error: ' + data.message);
			});
		};

		this.reload();
	</script>
</frost-public-timeline>
