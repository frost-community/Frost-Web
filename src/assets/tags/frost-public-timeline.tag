<frost-public-timeline>
	<div style='margin: 5rem auto' if={ loading }>
		<p>取得しています...</p>
	</div>
	<div style='margin: 5rem auto' if={ !loading && timelinePosts.length == 0 }>
		<p>投稿がありません。</p>
	</div>
	<ul if={ !loading && timelinePosts.length != 0 }>
		<li each={ post in timelinePosts }>
			<frost-post-status status={ post } />
		</li>
	</ul>

	<style>
		:scope {
			ul > li {
				list-style: none;
			}
		}
	</style>

	<script>
		const socket = opts.socket;

		this.timelinePosts = [];
		this.loading = true;

		this.reload = () => {
			this.update({loading: true});

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
					}
					else {
						alert(`api error: failed to fetch general timeline posts. ${data.response.message}`);
					}
				}
				else {
					alert(`internal error: ${restData.message}`);
				}

				socket.emit('timeline-connect', {type: 'public'});

				this.update({loading: false});
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

		socket.on('ready', (readyData) => {
			// タイムラインのリロード
			this.reload();
		});
	</script>
</frost-public-timeline>
