<frost-home>
	<div class='container'>
		<header>
			<div class='row' style='margin-top: 20%'>
				<div class='eight columns offset-by-three'>
					<h1>
						<img class='logo-icon' src='../images/apple-touch-icon.png' />
						Frost
					</h1>
				</div>
			</div>
		</header>

		<main>
			<p>Homeです。</p>
			<button type='button' onclick={signout}>Logout</button>

			<h5>リンク</h5>
			<ul>
				<li><a href='/dev' target='_blank'>Frost Developers Center</a></li>
			</ul>

			<h5>Create status form</h5>
			<form onsubmit={createStatus}>
				<input type='text' id='text' placeholder='ねえ今どんな気持ち？？'></input>
				<button type='submit'>post</button>
			</form>

			<h5>Public Timeline</h5>
			<div>
				<div class='box' style='margin: 10px 0' each={timelinePosts}>
					<p>{user.name} @{user.screenName}</p>
					<p>{text}</p>
					<p>createdAt: {createdAt}</p>
				</div>
			</div>
		</main>

		<frost-footer />
	</div>
	<script>
		import fetchJson from '../../scripts/fetch-json';

		this.timelinePosts = [];

		this.updateTimeline = () => {
			this.timelinePosts = [];
			fetchJson('POST', '/api', {method: 'get', endpoint: '/general/timeline', headers: {'x-api-version': 1.0}, _csrf: document.getElementsByName('_csrf').item(0).content}).then(res => {
				return res.json();
			}).then(json => {
				if (json.posts != null) {
					this.timelinePosts = json.posts;
					this.timelinePosts.reverse();
					this.update();
				}
			}).catch(reason => {
				console.log('update timeline error: ' + reason);
			});
		};
		this.updateTimeline();

		this.createStatus = (e) => {
			e.preventDefault();
			fetchJson('POST', '/api', {method: 'post', endpoint: '/posts/post_status', headers: {'x-api-version': 1.0}, body: {'text': document.getElementById('text').value}, _csrf: document.getElementsByName('_csrf').item(0).content}).then(res => {
				return res.json();
			}).then(json => {
				if (json.postStatus != null) {
					this.timelinePosts.splice(0, 0, json.postStatus);
					document.getElementById('text').value = '';
					this.update();
				}
				else {
					alert('Error: ' + json.message);
				}
			}).catch(reason => {
				console.log('update timeline error: ' + reason);
			});
		};

		this.signout = () => {
			fetchJson('DELETE', '/session', {
				_csrf: document.getElementsByName('_csrf').item(0).content
			}).then((res) => {
				document.cookie = 'sid=; max-age=0';
				location.reload();
			})
			.catch(reason => {
				console.log('Sign out error: ' + reason);
			});
		};
	</script>
</frost-home>
