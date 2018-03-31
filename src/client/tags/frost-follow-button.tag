<frost-follow-button>
	<button if={ showing } onclick={ follow }>{ following ? 'フォローしています' : 'フォロー' }</button>

	<script>
		const StreamingRest = require('../helpers/streaming-rest');

		this.on('mount', () => {
			(async () => {
				const streamingRest = new StreamingRest(this.webSocket);

				const rest = await streamingRest.request('get', `/users/${this.user.id}/followings/${this.opts.dataTargetId}`);
				if (rest.statusCode == 200) {
					this.following = rest.response.following;
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
						await streamingRest.request(this.following ? 'delete' : 'put', `/users/${this.user.id}/followings/${this.opts.dataTargetId}`);
						this.following = !this.following;
						this.update();
					})();
				};
				this.update();
			})().catch((err) => {
				console.error(err);
			});
		});

	</script>
</frost-follow-button>
