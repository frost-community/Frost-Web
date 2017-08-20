<frost-page-user>
	<div class='content'>
		<virtual if={ user != null }>
			<div class='side'>
				<h1>{ user.name } @{ user.screenName }</h1>
				<h2>プロフィール:</h2><!-- Profile -->
				<p>{ user.description }</p>
				<frost-follow-button data-target-id={ user.id } />
			</div>
			<div class='main'>
				<h1>{ user.name }さんの投稿</h1>
				<frost-timeline data-name='user', data-user-id={ user.id } />
			</div>
		</virtual>
		<p if={ loading }>読み込み中...</p>
		<p if={ !loading && user == null }>ユーザー情報の取得に失敗しました。</p>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			> .content {
				@include responsive();

				@include less-than($tablet) {
					flex-direction: column;
				}

				> .side {
					width: 250px;

					@include less-than($tablet) {
						margin-bottom: 2rem;
					}

					> h1 {
						font-size: 2.5rem;
					}

					> h2 {
						font-size: 2rem;
					}
				}

				> .main {
					flex: 1;
					min-width: 300px;

					h1 {
						font-size: 18px;
						margin-bottom: 10px;
					}
				}
			}
		}
	</style>

	<script>
		const StreamingRest = require('../helpers/StreamingRest');
		this.user = null;
		this.loading = true;

		const changedPageHandler = (pageId, params) => {
			if (pageId == 'user') {
				(async () => {
					const screenName = params[0];

					// ユーザー情報をフェッチ
					const streamingRest = new StreamingRest(this.webSocket);
					const rest = await streamingRest.requestAsync('get', '/users', {query: {'screen_names': screenName}});

					this.user = rest.response.users[0];
					this.loading = false;
					this.update();

					window.document.title = `Frost - @${screenName}さんのページ`;
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
</frost-page-user>
