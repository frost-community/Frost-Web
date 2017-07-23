<frost-create-status-form>
	<form onsubmit={ submit }>
		<h1>投稿する</h1>
		<textarea ref='text' placeholder='ねえ今どんな気持ち？' oninput={ input } required>{ text }</textarea>
		<span>{ textMax - getTextCount() }</span>
		<button type='submit' disabled={ !getValidTextCount() }>post</button>
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
		this.textMax = 256;
		this.text = '';

		this.getTextCount = () => {
			return this.text.length;
		}

		this.getValidTextCount = () => {
			return this.getTextCount() != 0 && this.textMax - this.getTextCount() >= 0;
		}

		this.clear = () => {
			this.update({text: ''});
		}

		// events

		this.input = () => {
			this.update({text: this.refs.text.value});
		}

		this.on('mount', () => {
			this.webSocket.on('rest', rest => {
				if (rest.request.endpoint == '/posts/post_status') {
					if (rest.success) {
						this.clear();
					}
					else {
						alert('status creation error: ' + rest.response.message);
					}
				}
			});

			this.createStatus = () => {
				this.webSocket.sendEvent('rest', {request: {
					method: 'post', endpoint: '/posts/post_status',
					headers: {'x-api-version': 1.0},
					body: {text: this.text}
				}});
			};

			this.submit = (e) => {
				e.preventDefault();
				this.createStatus();
			}
		});
	</script>
</frost-create-status-form>
