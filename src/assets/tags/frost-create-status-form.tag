<frost-create-status-form>
	<form onsubmit={submit}>
		<input type='text' id='text' placeholder='ねえ今どんな気持ち？'></input>
		<button type='submit'>post</button>
	</form>

	<script>
		import fetchJson from '../scripts/fetch-json';
		this.csrfToken = document.getElementsByName('_csrf').item(0).content;
		const obs = opts.obs;

		this.submit = (e) => {
			e.preventDefault();
			if (this.createStatus()) {
				this.clear();
				this.update();
			}
		};

		this.createStatus = () => {
			fetchJson('POST', '/api', {
				method: 'post',
				endpoint: '/posts/post_status',
				headers: {'x-api-version': 1.0},
				body: {'text': document.getElementById('text').value},
				_csrf: this.csrfToken
			}).then(res => {
				return res.json();
			}).then(json => {
				if (json.postStatus != null) {
					obs.trigger('create-status', json.postStatus);
					return true;
				}
				else {
					alert('Error: ' + json.message);
				}
			}).catch(reason => {
				console.log('update timeline error: ' + reason);
			});
			return false;
		};

		this.clear = () => {
			document.getElementById('text').value = '';
		};
	</script>
</frost-create-status-form>
