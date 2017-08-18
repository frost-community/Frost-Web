<frost-page-dev>
	<div class='content'>
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
				<frost-create-application-form />
			</div>
		</div>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			> .content {
				@include responsive();

				flex-direction: column;

				> .main > :not(:last-child) {
					margin-bottom: 2rem;
				}
			}
		}
	</style>

	<script>
		const changedPageHandler = (pageId) => {
			if (pageId == 'dev') {
				window.document.title = 'Frost Developers Center';

				this.central.off('ev:changed-page', changedPageHandler);
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);

			this.login = this.getLogin();
		});
	</script>
</frost-page-dev>
