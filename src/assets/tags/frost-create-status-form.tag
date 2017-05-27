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
		this.socket = opts.socket;
		this.textMax = 256;
		this.text = '';

		// methods

		getTextCount() {
			return this.text.length;
		}

		getValidTextCount() {
			return this.getTextCount() != 0 && this.textMax - this.getTextCount() >= 0;
		}

		createStatus() {
			this.socket.emit('rest', {request: {
				method: 'post', endpoint: '/posts/post_status',
				headers: {'x-api-version': 1.0},
				body: {text: this.text}
			}});
		}

		clear() {
			this.update({text: ''});
		}

		// events

		input() {
			this.update({text: this.refs.text.value});
		}

		submit(e) {
			e.preventDefault();
			this.createStatus();
		}

		this.socket.on('rest', (restData) => {
			if (restData.request.endpoint == '/posts/post_status') {
				if (restData.success) {
					this.clear();
				}
				else {
					alert('status creation error: ' + restData.response.message);
				}
			}
		});

	</script>
</frost-create-status-form>
