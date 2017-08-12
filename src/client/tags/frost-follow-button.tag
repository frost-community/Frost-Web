<frost-follow-button>
	<button if={ showing } onclick={ follow }>{ following ? 'フォローしています' : 'フォロー' }</button>

	<script>
		this.on('mount', () => {
			this.webSocket.on('rest', rest => {
				if (rest.request.endpoint == `/users/${this.user.id}/followings/${this.opts.dataTargetId}` && rest.request.method == 'get') {
					if (rest.success) {
						if (rest.statusCode == 204 || rest.statusCode == 404) {
							this.following = (rest.statusCode == 204);
							this.showing = true;
							this.update();
						}
						else if (rest.response.message == 'source user and target user is same') {
							// noop
						}
						else {
							alert(`api error: ${rest.response.message}`);
						}
					}
					else {
						alert(`internal error: ${rest.message}`);
					}
				}
			});

			this.webSocket.sendEvent('rest', {request: {
				method: 'get', endpoint: `/users/${this.user.id}/followings/${this.opts.dataTargetId}`,
				headers: {'x-api-version': 1.0}
			}});

			this.webSocket.on('rest', rest => {
				if (rest.request.endpoint == `/users/${this.user.id}/followings/${this.opts.dataTargetId}` && (rest.request.method == 'put' || rest.request.method == 'delete')) {
					this.following = !this.following;
					this.update();
				}
			});

			this.follow = () => {
				this.webSocket.sendEvent('rest', {request: {
					method: this.following ? 'delete' : 'put', endpoint: `/users/${this.user.id}/followings/${this.opts.dataTargetId}`,
					headers: {'x-api-version': 1.0}
				}});
			};
		});
	</script>
</frost-follow-button>
