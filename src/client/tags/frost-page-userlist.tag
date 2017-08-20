<frost-page-userlist>
	<div class='content'>
		<div class='main'>
			<h5>ユーザーの一覧</h5>
			<ul>
				<li each={ user in users }>
					<a href={ '/users/'+user.screenName }>{ user.name } @{ user.screenName }</a>
				</li>
			</ul>
			<p if={ loading }>読み込み中...</p>
			<p if={ !loading && users.length == 0 }>ユーザーリストの取得に失敗しました。</p>
		</div>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			> .content {
				@include responsive();
			}
		}
	</style>

	<script>
		const StreamingRest = require('../helpers/StreamingRest');
		this.users = [];
		this.loading = true;

		const changedPageHandler = (pageId) => {
			if (pageId == 'userlist') {
				(async () => {
					// ユーザー情報をフェッチ
					const streamingRest = new StreamingRest(this.webSocket);
					const rest = await streamingRest.requestAsync('get', '/users');

					this.users = rest.response.users;
					this.loading = false;
					this.update();

					window.document.title = 'Frost - ユーザーの一覧';
					this.central.off('ev:changed-page', changedPageHandler);
				})().catch(err => {
					console.error(err);
					this.loading = false;
					this.update();
				});
			}
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-userlist>
