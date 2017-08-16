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

		if (this.opts.dataName == null) {
			throw new Error('data-name property is required');
		}

		let endpoint, streaming;
		if (this.opts.dataName == 'home') {
			endpoint = `/users/${this.user.id}/timelines/home`;
			streaming = true;
		}
		else if (this.opts.dataName == 'user') {
			if (this.opts.dataUserId == null) {
				throw new Error('data-user-id property is required');
			}

			endpoint = `/users/${this.opts.dataUserId}/timelines/user`;
			streaming = false;
		}
		else if (this.opts.dataName == 'general') {
			endpoint = '/general/timeline';
			streaming = true;
		}
		else {
			throw new Error('data-name property is invalid');
		}

		this.restHandler = rest => {
			if (rest.request.endpoint == endpoint) {
				if (rest.success) {
					if (rest.response.posts != null) {
						this.timelinePosts = rest.response.posts;
					}
					else if (rest.statusCode != 204) {
						alert(`api error: failed to fetch ${this.opts.dataName} timeline posts. ${rest.response.message}`);
					}
				}
				else {
					alert(`internal error: ${rest.message}`);
				}

				if (streaming) {
					this.webSocket.sendEvent('timeline-connect', {type: this.opts.dataName});
				}

				this.loading = false;
				this.update();
			}
		};

		this.reconnectHandler = () => {
			console.log('reconnecting timeline...');
			this.webSocket.sendEvent('timeline-connect', {type: this.opts.dataName});
		};

		this.timelineConnectHandler = data => {
			console.log(data.message);
		};

		this.timelineDisconnectHandler = data => {
			console.log(data.message);
		};

		this.receiveStatusHandler = status => {
			console.log('status: ', status);
			this.timelinePosts.splice(0, 0, status);
			this.update();
		};

		this.reload = () => {
			this.loading = true;
			this.update();

			this.webSocket.sendEvent('rest', {request: {
				method: 'get', endpoint: endpoint,
				query: {limit: 100},
				headers: {'x-api-version': 1.0},
			}});
		};

		this.on('mount', () => {
			this.webSocket.on('rest', this.restHandler);
			this.reload(); // タイムラインのリロード

			if (streaming) {
				this.webSocket.addEventListener('open', this.reconnectHandler); // hint: onではなくaddEventListenerを使っているのはプリミティブ(非ユーザー定義)なイベントだから
				this.webSocket.one('timeline-connect', this.timelineConnectHandler);
				this.webSocket.one('timeline-disconnect', this.timelineDisconnectHandler);
				this.webSocket.on(`stream:${this.opts.dataName}-timeline-status`, this.receiveStatusHandler);
			}
		});

		this.on('unmount', () => {
			this.webSocket.off('rest', this.restHandler);
			if (streaming) {
				this.webSocket.sendEvent('timeline-disconnect', {type: this.opts.dataName});
				this.webSocket.removeEventListener('open', this.reconnectHandler);
				this.webSocket.off(`stream:${this.opts.dataName}-timeline-status`, this.receiveStatusHandler);
			}
		});
	</script>
</frost-timeline>
