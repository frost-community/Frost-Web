<frost-public-timeline>
	<div class='box' style='margin: 10px 0' each={timelinePosts}>
		<p>{user.name} @{user.screenName}</p>
		<p>{text}</p>
		<p>{ parent.moment.unix(createdAt).fromNow() }</p>
	</div>
	<script>
		import moment from 'moment';
		this.moment = moment;
		const socket = opts.socket;

		this.timelinePosts = [];

		this.reload = () => {
			this.timelinePosts = [];

			socket.emit('rest', {request: {
				method: 'get', endpoint: '/general/timeline',
				headers: {'x-api-version': 1.0},
			}});

			socket.on('rest', (data) => {
				if (data.request.endpoint == '/general/timeline') {
					if (data.posts != null) {
						this.timelinePosts = data.posts;
						this.timelinePosts.reverse();
						this.update();

						socket.emit('timeline-connect', {type: 'public'});
					}
				}
			});

			socket.on('data:public:status', (statusData) => {
				console.log('status: ' + statusData);
				this.timelinePosts.splice(0, 0, statusData);
				this.update();
			});
		};

		socket.on('ready', () => {
			this.reload();
		});

		socket.on('success', (data) => {
			console.log('success: ' + data.message);
		});

		socket.on('error', (data) => {
			console.log('error: ' + data.message);
		});
	</script>
</frost-public-timeline>
