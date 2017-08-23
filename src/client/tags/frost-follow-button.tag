<frost-follow-button>
	<button if={ showing } onclick={ follow }>{ following ? 'フォローしています' : 'フォロー' }</button>

	<script>
		const StreamingRest = require('../helpers/StreamingRest');

		this.on('mount', () => {
			(async () => {
				const streamingRest = new StreamingRest(this.webSocket);

				const rest = await streamingRest.requestAsync('get', `/users/${this.user.id}/followings/${this.opts.dataTargetId}`);
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

				this.follow = () => {
					(async () => {
						await streamingRest.requestAsync(this.following ? 'delete' : 'put', `/users/${this.user.id}/followings/${this.opts.dataTargetId}`);
						this.following = !this.following;
						this.update();
					})();
				};
				this.update();
			})().catch(err => {
				console.error(err);
			});
		});

	</script>
</frost-follow-button>
