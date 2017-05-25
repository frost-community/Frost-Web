<frost-create-status-form>
	<form onsubmit={ submit }>
		<h1>投稿する</h1>
		<textarea id='text' placeholder='ねえ今どんな気持ち？'></textarea>
		<button type='submit'>post</button>
	</form>

	<style>
		:scope {
			form {
				display: flex;
				flex-direction: column;
				background-color: hsla(0, 0%, 0%, 0.015);
				padding: 1rem;
				border-radius: 4px;

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
			}
		}
	</style>

	<script>
		const socket = opts.socket;

		this.submit = (e) => {
			e.preventDefault();
			this.createStatus();
		};

		this.createStatus = () => {
			socket.emit('rest', {request: {
				method: 'post', endpoint: '/posts/post_status',
				headers: {'x-api-version': 1.0},
				body: {text: document.getElementById('text').value}
			}});
		};

		socket.on('rest', (restData) => {
			if (restData.request.endpoint == '/posts/post_status') {
				if (restData.success) {
					this.clear();
					this.update();
				}
				else {
					alert('status creation error: ' + restData.response.message);
				}
			}
		});

		this.clear = () => {
			document.getElementById('text').value = '';
		};
	</script>
</frost-create-status-form>
