<frost-public-timeline>
	<div class='box' style='margin: 10px 0' each={ timelinePosts }>
		<p>{ user.name } @{ user.screenName }</p>
		<p>{ text }</p>
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
		};

		socket.on('rest', (restData) => {
			if (restData.request.endpoint == '/general/timeline') {
				if (restData.success) {
					if (restData.response.posts != null) {
						this.timelinePosts = restData.response.posts;
						this.timelinePosts.reverse();
						this.update();
					}
					else {
						return alert(`api error: failed to fetch general timeline posts. ${data.response.message}`);
					}
				}
				else {
					alert(`internal error: ${restData.message}`);
				}

				socket.emit('timeline-connect', {type: 'public'});
			}
		});

		socket.on('timeline-connect', (data) => {
			console.log(data.message);
		});

		socket.on('data:public:status', (statusData) => {
			console.log('status: ' + statusData);
			this.timelinePosts.splice(0, 0, statusData);
			this.update();
		});

		// 定期的に画面を更新
		setInterval(() => {
			this.update();
		}, 60 * 1000);

		socket.on('ready', (readyData) => {
			// タイムラインのリロード
			this.reload();
		});
	</script>
</frost-public-timeline>
