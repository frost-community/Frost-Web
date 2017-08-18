<frost-page-userlist>
	<div class='content'>
		<div class='main'>
			<h5>Frostのユーザーの一覧</h5>
			<ul>
				<li each={ user in users }>
					<a href={ '/users/'+user.screenName }>@{ user.screenName }</a>
				</li>
			</ul>
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

		const changedPageHandler = (pageId) => {
			if (pageId == 'userlist') {
				(async () => {
					// ユーザー情報をフェッチ
					const streamingRest = new StreamingRest(this.webSocket);
					const rest = await streamingRest.requestAsync('get', '/users');
					this.users = rest.response.users;

					this.update();

					window.document.title = 'Frost - ユーザーの一覧';
					this.central.off('ev:changed-page', changedPageHandler);
				})();
			}
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-userlist>
