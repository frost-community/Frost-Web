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
		this.timelinePosts = [];
		this.loading = true;

		reload() {
			this.update({loading: true});

			this.webSocket.sendEvent('rest', {request: {
				method: 'get', endpoint: '/general/timeline',
				headers: {'x-api-version': 1.0},
			}});
		}

		this.on('mount', () => {
			// タイムラインのリロード
			this.reload();

			this.webSocket.addEventListener('rest', event => {
				const restData = event.data;

				if (restData.request.endpoint == '/general/timeline') {
					if (restData.success) {
						if (restData.response.posts != null) {
							this.timelinePosts = restData.response.posts;
							this.timelinePosts.reverse();
						}
						else {
							alert(`api error: failed to fetch general timeline posts. ${restData.response.message}`);
						}
					}
					else {
						alert(`internal error: ${restData.message}`);
					}

					this.webSocket.sendEvent('timeline-connect', {type: 'public'});

					this.update({loading: false});
				}
			});

			this.webSocket.addEventListener('timeline-connect', event => {
				console.log(event.data.message);
			});

			this.webSocket.addEventListener('data:public:status', event => {
				const statusData = event.data;

				console.log('status: ' + statusData);
				this.timelinePosts.splice(0, 0, statusData);
				this.update();
			});
		});
	</script>
</frost-public-timeline>
