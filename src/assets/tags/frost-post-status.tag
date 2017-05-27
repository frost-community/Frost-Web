<frost-post-status>
	<div class='side'></div>
	<div class='main'>
		<div class='info'>
			<div class='name'>{ status.user.name } @{ status.user.screenName }</div>
			<time>{ moment.unix(opts.status.createdAt).fromNow() }</time>
		</div>
		<p ref='text'></p>

	</div>

	<style>
		:scope {
			display: flex;
			flex-direction: row;
			margin: 10px 0;

			.side {
				min-width: 72px;
			}

			.main {
				width: 100%;

				.info {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
				}
			}
		}
	</style>

	<script>
		import moment from 'moment';
		this.moment = moment;
		this.status = opts.status;

		this.compileText = (text) => {
			text = text
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/\n/g, '<br />');

			return text;
		};

		this.on('mount', () => {
			this.refs.text.innerHTML = this.compileText(this.status.text);
		});

		// 定期的に画面を更新
		setInterval(() => {
			this.update();
		}, 60 * 1000);
	</script>
</frost-post-status>
