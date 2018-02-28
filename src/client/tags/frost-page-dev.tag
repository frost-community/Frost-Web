<frost-page-dev>
	<div class='main'>
		<div>
			<h4>APIドキュメント</h4><!-- API document -->
			<a href='http://docs.snsfrost.apiary.io/' target='_blank'>Apiary - Frost-API (日本語)</a>
		</div>
		<div if={ login }>
			<h4>登録済みの連携アプリケーション</h4> <!-- Your registered applications -->
			<frost-applications />
		</div>
		<div if={ login }>
			<frost-form-create-application />
		</div>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			flex-direction: column;

			> .main {
				> :not(:last-child) {
					margin-bottom: 1.5rem;
				}
			}
		}
	</style>

	<script>
		const changedPageHandler = (pageId) => {
			if (pageId == 'dev') {
				this.central.off('ev:changed-page', changedPageHandler);
				window.document.title = 'Frost Developers Center';

				this.update();
			}
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);

			this.login = this.getLoginStatus();
		});
	</script>
</frost-page-dev>
