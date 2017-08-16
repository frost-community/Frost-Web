<frost-page-user>
	<div class='content'>
		<div class='side'>
			<h1>{ user.name } @{ user.screenName }</h1>
			<h2>Description:</h2>
			<p>{ user.description }</p>
			<frost-follow-button data-target-id={ user.id } />
		</div>
		<div class='main'>
			<h1>{ user.name }さんの投稿</h1>
			<frost-timeline data-name='user', data-user-id={ user.id } />
		</div>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			> .content {
				@include responsive(row);

				> .side {
					width: 250px;

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
		this.user = {name: '', screenName: '', id: ''};

		const changedPageHandler = (pageId, params) => {
			if (pageId == 'user') {
				const screenName = params[0];
				// TODO: ユーザー情報をフェッチ
				this.user.screenName = screenName;
				window.document.title = `Frost - @${screenName}さんのページ`;

				this.central.off('ev:changed-page', changedPageHandler);
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-user>
