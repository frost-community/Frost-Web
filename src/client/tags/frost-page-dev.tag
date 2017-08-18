<frost-page-dev>
	<div class='content'>
		<div class='main'>
			<div class='row' style='margin-top: 30px'>
				<h4>API Document</h4>
				<a href='http://docs.snsfrost.apiary.io/' target='_blank'>Frost-API (日本語) - Apiary</a>
			</div>
			<div class='row' style='margin-top: 30px'>
				<h4>あなたが登録したアプリケーション (Your registered applications)</h4>
				<frost-applications />
			</div>
			<div class='row' style='margin-top: 30px'>
				<frost-create-application-form />
			</div>
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
		const changedPageHandler = (pageId) => {
			if (pageId == 'dev') {
				window.document.title = 'Frost Developers Center';

				this.central.off('ev:changed-page', changedPageHandler);
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-dev>
