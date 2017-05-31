<frost-post-status>
	<div class='side'></div>
	<div class='main'>
		<div class='info'>
			<a href={ '/users/' + status.user.screenName }>{ status.user.name } @{ status.user.screenName }</a>
			<time datetime={ getTime().format() } title={ getTime().format() }>{ getTime().fromNow() }</time>
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
				word-break: break-word;

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
		import 'moment/';
		this.moment = moment;
		this.status = opts.status;

		this.getTime = () => {
			return this.moment.unix(this.status.createdAt);
		};

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
