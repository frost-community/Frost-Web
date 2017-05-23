<frost-create-status-form>
	<form onsubmit={ submit }>
		<input type='text' id='text' placeholder='ねえ今どんな気持ち？'></input>
		<button type='submit'>post</button>
	</form>

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
