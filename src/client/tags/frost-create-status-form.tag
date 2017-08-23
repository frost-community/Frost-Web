<frost-create-status-form>
	<form onsubmit={ submit } onkeydown={ keydown } onkeyup={ keyup }>
		<h1>投稿する</h1>
		<textarea ref='text' placeholder='ねえ今どんな気持ち？' oninput={ input } required>{ text }</textarea>
		<span>{ textMax - getTextCount() }</span>
		<button type='submit' disabled={ !getValidTextCount() }>投稿</button>
	</form>

	<style>
		:scope {
			form {
				display: flex;
				flex-direction: column;

				h1 {
					font-size: 18px;
					margin-bottom: 1rem;
				}

				textarea {
					height: 12rem;
				}

				button {
					width: 10rem;
					align-self: flex-end;
				}

				button:disabled {
					cursor: default;
				}
			}
		}
	</style>

	<script>
		const StreamingRest = require('../helpers/StreamingRest');
		this.textMax = 256;
		this.text = '';
		this.keyBuffer = [];

		// methods

		this.getTextCount = () => this.text.length;
		this.getValidTextCount = () => this.getTextCount() != 0 && this.textMax - this.getTextCount() >= 0;
		this.getNeedSubmit = () => ((this.keyBuffer[17] || this.keyBuffer[91]) && this.keyBuffer[13]) == true; // Ctrl + Enter

		this.clear = () => {
			this.text = '';
			this.update();
		};

		this.checkShortcut = () => {
			if (this.getNeedSubmit()) {
				if (this.createStatus) {
					this.createStatus();
				}
			}
		};

		// input events

		this.submit = (e) => {
			e.preventDefault();

			if (this.createStatus) {
				this.createStatus();
			}
		};

		this.input = (e) => {
			this.text = this.refs.text.value;
			this.update();
		};

		this.keydown = (e) => {
			this.keyBuffer[e.which] = true;
		};

		this.keyup = (e) => {
			this.checkShortcut();

			this.keyBuffer[e.which] = false;
		};

		this.on('mount', () => {

			// methods

			this.createStatus = () => {
				(async () => {
					const streamingRest = new StreamingRest(this.webSocket);
					const rest = await streamingRest.requestAsync('post', '/posts/post_status', {body: {text: this.text}});
					this.clear();
				})().catch(err => {
					console.error(err);
				});
			};
		});
	</script>
</frost-create-status-form>
