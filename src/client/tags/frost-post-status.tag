<frost-post-status>
	<div class='side'></div>
	<div class='main'>
		<div class='info'>
			<a href={ '/users/' + opts.status.user.screenName } target='_blank'>{ opts.status.user.name } @{ opts.status.user.screenName }</a>
			<time datetime={ getTime().format() } title={ getTime().format() }>{ getTime().fromNow() }</time>
		</div>
		<div class='text' ref='text'></div>
	</div>

	<style>
		:scope {
			display: flex;
			flex-direction: row;
			margin: 2.5rem 0;

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
					margin-bottom: 0.5rem;

					a {
						text-decoration-line: none;
					}
				}

				.text {
					p {
						margin-bottom: 0;
					}
				}
			}
		}
	</style>

	<script>
		this.moment = require('moment');

		getTime() {
			return this.moment.unix(this.opts.status.createdAt);
		}

		compileText(text) {
			let compiledText = '<p>';

			compiledText += text
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/'/g, '&#039;')
				.replace(/"/g, '&quot;')
				.replace(/`/g, '&#x60;')
				.replace(/((https?|ftp):\/\/[^\s/$.?#].[^\s]*)/ig, '<a href=\'$1\' target=\'_blank\'>$1</a>') // url
				.replace(/\n/g, '</p><p>'); // 改行

			compiledText += '</p>';

			return compiledText;
		}

		this.on('mount', () => {
			this.refs.text.innerHTML = this.compileText(this.opts.status.text);

			// 定期的に画面を更新
			setInterval(() => {
				this.update();
			}, 60 * 1000);
		});
	</script>
</frost-post-status>
