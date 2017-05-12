<frost-public-timeline>
	<div class='box' style='margin: 10px 0' each={timelinePosts}>
		<p>{user.name} @{user.screenName}</p>
		<p>{text}</p>
		<p>{ parent.moment.unix(createdAt).fromNow() }</p>
	</div>
	<script>
		import fetchJson from '../scripts/fetch-json';
		import moment from 'moment';
		this.moment = moment;
		this.csrfToken = document.getElementsByName('_csrf').item(0).content;
		const obs = opts.obs;

		this.timelinePosts = [];

		obs.on('create-status', (status) => {
			this.add(status);
		});

		this.add = (statuses) => {
			if (Array.isArray(statuses) && statuses.length != 0) {
				for (const status of statuses) {
					this.timelinePosts.splice(0, 0, status);
				}
				this.update();
			}
			else if (statuses != null) {
				this.timelinePosts.splice(0, 0, statuses);
				this.update();
			}
		};

		this.reload = () => {
			this.timelinePosts = [];
			fetchJson('POST', '/api', {
				method: 'get',
				endpoint: '/general/timeline',
				headers: {'x-api-version': 1.0},
				_csrf: this.csrfToken
			}).then(res => {
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

		this.reload();
	</script>
</frost-public-timeline>
