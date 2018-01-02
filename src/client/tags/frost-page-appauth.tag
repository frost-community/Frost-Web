<frost-page-appauth>
	<div class='main'>
		<h4>アプリケーション連携</h4>
		<frost-form-appauth></frost-form-appauth>
	</div>

	<style>
		@import "../styles/variables";

		:scope {

		}
	</style>

	<script>
		this.loading = true;

		const changedPageHandler = async (pageId) => {
			if (pageId == 'appauth') {
				this.central.off('ev:changed-page', changedPageHandler);
				window.document.title = 'Frost - アプリケーション連携';

				this.update();
			}
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-appauth>
