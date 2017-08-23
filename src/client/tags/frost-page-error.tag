<frost-page-error>
	<div class='main'>
		<h3>ごめんなさい... エラーが発生しました。</h3><!-- Sorry... An error has occurred. -->
		<p>内容: { message }</p><!-- Message -->
	</div>

	<style>
		@import "../styles/variables";

		:scope {

		}
	</style>

	<script>
		this.message = '';

		const changedPageEventHandler = (pageId, params) => {
			if (pageId == 'error') {
				const metaError = document.getElementsByName('frost-error').item(0);
				const metaCode = document.getElementsByName('frost-code').item(0);

				if (metaError != null) {
					this.message = metaError.content;
					const code = metaCode.content;
					metaError.remove();
					metaCode.remove();

					window.document.title = `Frost - Error ${code}`;
				}
				else {
					this.message = params.message || 'no message';

					window.document.title = `Frost - Error`;
				}

				this.central.off('ev:changed-page', changedPageEventHandler);
			}
			this.update();
		};

		const changeErrorHandler = error => {
			this.message = error.message || 'no message';
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageEventHandler);
			this.central.on('change-error', changeErrorHandler);
		});

		this.on('unmount', () => {
			this.central.off('change-error', changeErrorHandler);
		});
	</script>
</frost-page-error>
