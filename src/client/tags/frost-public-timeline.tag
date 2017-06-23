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
				query: {limit: 100},
				headers: {'x-api-version': 1.0},
			}});
		}

		this.on('mount', () => {
			// タイムラインのリロード
			this.reload();

			this.webSocket.on('rest', rest => {
				if (rest.request.endpoint == '/general/timeline') {
					if (rest.success) {
						if (rest.response.posts != null) {
							this.timelinePosts = rest.response.posts;
							this.timelinePosts.reverse();
						}
						else {
							alert(`api error: failed to fetch general timeline posts. ${rest.response.message}`);
						}
					}
					else {
						alert(`internal error: ${rest.message}`);
					}

					this.webSocket.sendEvent('timeline-connect', {type: 'public'});

					this.update({loading: false});
				}
			});

			this.webSocket.addEventListener('open', () => {
				console.log('reconnecting timeline...');
				this.webSocket.sendEvent('timeline-connect', {type: 'public'});
			});

			this.webSocket.on('timeline-connect', data => {
				console.log(data.message);
			});

			this.webSocket.on('data:public:status', status => {
				console.log('status: ' + status);
				this.timelinePosts.splice(0, 0, status);
				this.update();
			});
		});
	</script>
</frost-public-timeline>
