<frost-timeline>
	<div class='information' if={ loading }>
		<i class="fa fa-spinner fa-spin fa-fw" aria-hidden="true"></i>
		取得しています...
	</div>
	<div class='information' if={ !loading && timelinePosts.length == 0 }>
		<i class="fa fa-info-circle fa-fw" aria-hidden="true"></i>
		投稿がありません。
	</div>
	<div class='information' if={ !loading && timelinePosts.length == 0 && error }>
		<i class="fa fa-exclamation-triangle fa-fw" aria-hidden="true"></i>
		タイムラインの取得中にエラーが発生しました。
	</div>
	<ul if={ !loading && timelinePosts.length != 0 }>
		<li each={ post in timelinePosts }>
			<frost-post-status data-post-id={ post.id } status={ post } />
		</li>
	</ul>

	<style>
		@import "../styles/variables";

		:scope {
			> .information,
			> ul {
				@include greater-than($tablet) {
					border: 1px solid hsl(0, 0%, 88%);
					border-radius: 0.25rem;
				}
			}

			> .information {
				padding: 1rem 0;
				font-size: 0.95rem;

				@include greater-than($tablet) {
					background-color: hsla(0, 0%, 0%, 0.02);
					padding: 1.5rem 2rem;
				}
			}

			> ul {
				> li {
					list-style: none;

					@include greater-than($tablet) {
						&:not(:last-child) {
							border-bottom: 1px solid hsl(0, 0%, 88%);
						}

						> frost-post-status {
							margin: 1.25rem;
						}
					}
				}
			}
		}
	</style>

	<script>
		const StreamingRest = require('../helpers/StreamingRest');
		this.timelinePosts = [];
		this.loading = false;
		this.error = false;

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

		this.reconnectHandler = () => {
			console.log('reconnecting timeline...');
			this.webSocket.sendEvent('timeline-connect', { type: this.opts.dataName });
		};

		this.timelineConnectHandler = (data) => {
			console.log(data.message);
		};

		this.timelineDisconnectHandler = (data) => {
			console.log(data.message);
		};

		this.receiveStatusHandler = (data) => {
			console.log('status: ', data.resource);
			this.timelinePosts.splice(0, 0, data.resource);
			this.update();
		};

		this.reload = () => {
			this.loading = true;
			this.update();

			(async () => {
				const streamingRest = new StreamingRest(this.webSocket);
				const rest = await streamingRest.requestAsync('get', endpoint, { query: { limit: 100 } });
				if (rest.response.posts == null) {
					if (rest.statusCode != 204) {
						alert(`api error: failed to fetch ${this.opts.dataName} timeline posts. ${rest.response.message}`);
					}
					rest.response.posts = [];
				}
				this.timelinePosts = rest.response.posts;

				if (streaming) {
					this.webSocket.sendEvent('timeline-connect', { type: this.opts.dataName });
				}

				this.error = false;
				this.loading = false;
				this.update();
			})().catch((err) => {
				console.error(err);
				this.error = true;
				this.loading = false;
				this.update();
			});
		};

		this.on('mount', () => {
			this.reload(); // タイムラインの読み込み

			if (streaming) {
				this.webSocket.addEventListener('open', this.reconnectHandler); // memo: onではなくaddEventListenerを使っているのはプリミティブ(非ユーザー定義)なイベントだから
				this.webSocket.one('timeline-connect', this.timelineConnectHandler);
				this.webSocket.one('timeline-disconnect', this.timelineDisconnectHandler);
				this.webSocket.on(`stream:${this.opts.dataName}-timeline-status`, this.receiveStatusHandler);
			}
		});

		this.on('unmount', () => {
			if (streaming) {
				this.webSocket.sendEvent('timeline-disconnect', { type: this.opts.dataName });
				this.webSocket.removeEventListener('open', this.reconnectHandler);
				this.webSocket.off(`stream:${this.opts.dataName}-timeline-status`, this.receiveStatusHandler);
			}
		});
	</script>
</frost-timeline>
