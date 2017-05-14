<frost-create-status-form>
	<form onsubmit={submit}>
		<input type='text' id='text' placeholder='ねえ今どんな気持ち？'></input>
		<button type='submit'>post</button>
	</form>

	<script>
		const obs = opts.obs;
		const socket = opts.socket;

		this.submit = (e) => {
			e.preventDefault();
			if (this.createStatus()) {
				this.clear();
				this.update();
			}
		};

		this.createStatus = () => {
			socket.emit('rest', {request: {
				method: 'post', endpoint: '/posts/post_status',
				headers: {'x-api-version': 1.0},
				body: {text: document.getElementById('text').value}
			}}); /* TODO: need csrf? */

			socket.on('rest', (data) => {
				if (data.request.endpoint == '/posts/post_status') {
					if (json.postStatus != null) {
						obs.trigger('create-status', json.postStatus);
						return true;
					}
					else {
						alert('Error: ' + json.message);
					}
				}
			});

			socket.on('success', (data) => {
				console.log('success: ' + data.message);
			});

			socket.on('error', (data) => {
				console.log('error: ' + data.message);
			});
		};

		this.clear = () => {
			document.getElementById('text').value = '';
		};
	</script>
</frost-create-status-form>
