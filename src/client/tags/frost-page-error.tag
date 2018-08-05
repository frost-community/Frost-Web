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
				this.central.off('ev:changed-page', changedPageEventHandler);

				if (params.message != null) {
					this.message = params.message;
				}
				else if (this.error != null) {
					this.message = this.error;
				}
				else {
					this.message = 'no message';
				}

				window.document.title = `Frost - Error ${this.code || ''}`;
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageEventHandler);
		});
	</script>
</frost-page-error>
