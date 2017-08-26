<frost-post-status>
	<div class='side'><div class='icon'></div></div>
	<div class='main'>
		<div class='info'>
			<a href={ '/users/' + opts.status.user.screenName }>{ opts.status.user.name } @{ opts.status.user.screenName }</a>
			<time datetime={ getTime().format() } title={ getTime().format() }>{ getTime().fromNow() }</time>
		</div>
		<div class='text' ref='text'></div>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			display: flex;
			margin: 1rem 0;

			> .side {
				> .icon {
					margin: 0.3rem 1rem 0;
					min-height: 4rem;
					min-width: 4rem;
					background-color: hsla(0, 0%, 0%, 0.05);
				}
			}

			> .main {
				width: 100%;
				word-break: break-word;

				> .info {
					display: flex;
					justify-content: space-between;

					> a {
						text-decoration-line: none;

						// テキストの省略
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					> time {
						font-size: 0.9rem;

						// 幅固定
						flex-shrink: 0;
					}
				}

				> .text {
					> p {
						margin-bottom: 0;
					}
				}
			}
		}
	</style>

	<script>
		this.moment = require('moment');

		getTime() {
			this.moment.locale("ja");
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
