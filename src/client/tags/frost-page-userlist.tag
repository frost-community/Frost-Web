<frost-page-userlist>
	<div class='main'>
		<h4>ユーザーの一覧</h4>
		<ul>
			<li each={ user in users }>
				<a href={ '/users/'+user.screenName }>{ user.name } @{ user.screenName }</a>
			</li>
		</ul>
		<p if={ loading }>読み込み中...</p>
		<p if={ !loading && users.length == 0 }>ユーザーリストの取得に失敗しました。</p>
	</div>

	<style>
		@import "../styles/variables";

		:scope {

		}
	</style>

	<script>
		const StreamingRest = require('../helpers/StreamingRest');
		this.users = [];
		this.loading = true;

		const changedPageHandler = async (pageId) => {
			if (pageId == 'userlist') {
				this.central.off('ev:changed-page', changedPageHandler);
				window.document.title = 'Frost - ユーザーの一覧';

				try {
					// ユーザー情報をフェッチ
					const streamingRest = new StreamingRest(this.webSocket);
					const rest = await streamingRest.requestAsync('get', '/users');

					this.users = rest.response.users;
					this.loading = false;
					this.update();
				}
				catch(err) {
					console.error(err);
					this.loading = false;
				}

				this.update();
			}
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-userlist>
