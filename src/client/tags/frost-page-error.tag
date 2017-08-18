<frost-page-error>
	<div class='content'>
		<div class='main'>
			<h3>ごめんなさい... エラーが発生しました。</h3><!-- Sorry... An error has occurred. -->
			<p>内容: { message }</p><!-- Message -->
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
		const el = document.getElementsByName('frost-error').item(0);
		this.message = el != null ? el.content : 'no message';

		const changedPageEventHandler = pageId => {
			if (pageId == 'error') {
				const code = document.getElementsByName('frost-errorCode').item(0).content;
				window.document.title = `Frost - Error ${code}`;

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
