<frost-timeline>
	<div style='margin: 5rem auto' if={ loading }>
		<p>取得しています...</p>
	</div>
	<div style='margin: 5rem auto' if={ !loading && timelinePosts.length == 0 }>
		<p>投稿がありません。</p>
	</div>
	<ul if={ !loading && timelinePosts.length != 0 }>
		<li each={ post in timelinePosts }>
			<frost-post-status data-post-id={ post.id } status={ post } />
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

		if (this.opts.dataTimelineType == null) {
			throw new Error('data-timeline-type is required');
		}

		let endpoint, streaming;
		if (this.opts.dataTimelineType == 'home') {
			endpoint = `/users/${this.user.id}/timelines/home`;
			streaming = true;
		}
		else if (this.opts.dataTimelineType == 'user') {
			if (this.opts.dataUserId == null) {
				throw new Error('data-user-id is required');
			}

			endpoint = `/users/${this.opts.dataUserId}/timelines/user`;
			streaming = false;
		}
		else if (this.opts.dataTimelineType == 'general') {
			endpoint = '/general/timeline';
			streaming = true;
		}
		else {
			throw new Error('data-timeline-type is invalid');
		}

		console.log(endpoint);

		this.on('mount', () => {
			this.reload = () => {
				this.update({loading: true});

				this.webSocket.sendEvent('rest', {request: {
					method: 'get', endpoint: endpoint,
					query: {limit: 100},
					headers: {'x-api-version': 1.0},
				}});
			};

			// タイムラインのリロード
			this.reload();

			this.webSocket.on('rest', rest => {
				if (rest.request.endpoint == endpoint) {
					if (rest.success) {
						if (rest.response.posts != null) {
							this.timelinePosts = rest.response.posts;
						}
						else if (rest.statusCode != 204) {
							alert(`api error: failed to fetch ${this.opts.dataTimelineType} timeline posts. ${rest.response.message}`);
						}
					}
					else {
						alert(`internal error: ${rest.message}`);
					}

					if (streaming) {
						this.webSocket.sendEvent('timeline-connect', {type: this.opts.dataTimelineType});
					}

					this.update({loading: false});
				}
			});

			if (streaming) {
				this.webSocket.addEventListener('open', () => {
					console.log('reconnecting timeline...');
					this.webSocket.sendEvent('timeline-connect', {type: this.opts.dataTimelineType});
				});

				this.webSocket.on('timeline-connect', data => {
					console.log(data.message);
				});

				this.webSocket.on(`data:${this.opts.dataTimelineType}:status`, status => {
					console.log('status: ' + status);
					this.timelinePosts.splice(0, 0, status);
					this.update();
				});
			}
		});
	</script>
</frost-timeline>
