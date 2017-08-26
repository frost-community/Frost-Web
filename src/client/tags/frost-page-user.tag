<frost-page-user>
	<virtual if={ user != null }>
		<div class='side'>
			<h4>{ user.name } @{ user.screenName }</h4>
			<h5>プロフィール:</h5><!-- Profile -->
			<p>{ user.description != '' ? user.description : 'まだ設定されていません' }</p>
			<frost-follow-button data-target-id={ user.id } />
		</div>
		<div class='main'>
			<h5>{ user.name }さんの投稿</h5>
			<frost-timeline data-name='user', data-user-id={ user.id } />
		</div>
	</virtual>
	<p if={ loading }>読み込み中...</p>
	<p if={ !loading && user == null }>ユーザー情報の取得に失敗しました。</p>

	<style>
		@import "../styles/variables";

		:scope {
			@include less-than($tablet) {
				flex-direction: column;
			}

			> .side {
				width: 250px;

				@include less-than($tablet) {
					margin-bottom: 1.1rem;
				}

				> h1 {
					font-size: 1.4rem;
				}

				> h2 {
					font-size: 1.1rem;
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
	</style>

	<script>
		const StreamingRest = require('../helpers/StreamingRest');
		this.user = null;
		this.loading = true;

		const changedPageHandler = (pageId, params) => {
			if (pageId == 'user') {
				(async () => {
					// ユーザー情報をフェッチ
					const streamingRest = new StreamingRest(this.webSocket);
					const rest = await streamingRest.requestAsync('get', '/users', {query: {'screen_names': params.screenName}});

					this.user = rest.response.users[0];
					this.loading = false;
					this.update();

					window.document.title = `Frost - @${params.screenName}さんのページ`;
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
