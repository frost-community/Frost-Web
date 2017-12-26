<frost-form-create-status>
	<form onsubmit={ submit } onkeydown={ keydown } onkeyup={ keyup }>
		<h6>投稿する</h6>
		<textarea ref='text' placeholder='ねえ今どんな気持ち？' oninput={ input } required>{ text }</textarea>
		<div class='tool-bar'>
			<span>{ textMax - getTextCount() }</span>
			<button type='submit' disabled={ !validTextCount() || lock }>投稿</button>
		</div>
	</form>

	<style>
		@import "../styles/variables";

		:scope {
			> form {
				display: flex;
				flex-direction: column;

				> textarea {
					height: 7rem;
					font-size: 0.9rem;
				}

				> .tool-bar {
					display: flex;
					align-items: center;

					> button {
						width: 100px;
						margin-left: auto;

						&:disabled {
							cursor: default;
						}
					}
				}
			}
		}
	</style>

	<script>
		const StreamingRest = require('../helpers/StreamingRest');
		this.textMax = 256;
		this.text = '';
		this.lock = false;

		// methods

		this.getTextCount = () => {
			return this.text.length;
		};

		this.validTextCount = () => {
			return this.getTextCount() != 0 && this.textMax - this.getTextCount() >= 0;
		};

		this.clear = () => {
			this.text = '';
			this.update();
		};

		// input events

		this.input = (ev) => {
			this.text = this.refs.text.value; // 入力された文字列を反映
			this.update();
		};

		this.keydown = (ev) => {
			const needSubmit = (ev.metaKey || ev.ctrlKey) && ev.code == 'Enter';

			if (needSubmit && this.validTextCount()) {
				// lock submit button
				this.lock = true;
				this.createStatus();
			}
		};

		this.on('mount', () => {

			// methods

			this.createStatus = () => {
				(async () => {
					const streamingRest = new StreamingRest(this.webSocket);
					const rest = await streamingRest.requestAsync('post', '/posts/post_status', { body: { text: this.text } });
					this.clear();
					return 'success';
				})().catch((err) => {
					console.error(err);
					return 'failed';
				}).then((status) => {
					console.log(status);
					this.lock = false;
				});
			};

			// input events

			this.submit = (ev) => {
				ev.preventDefault();

				if (this.validTextCount()) {
					this.createStatus();
				}

				return false;
			};

			this.update();
		});
	</script>
</frost-form-create-status>
