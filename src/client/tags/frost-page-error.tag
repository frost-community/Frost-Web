<frost-page-error>
	<div class='content'>
		<div class='main'>
			<h3>Sorry... An error has occurred.</h3>
			<p>Message: { message }</p>
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

		const changedPageHandler = (pageId) => {
			if (pageId == 'error') {
				const code = document.getElementsByName('frost-errorCode').item(0).content;
				window.document.title = `Frost - Error ${code}`;
				console.log('title changed');
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);

			this.central.on('change-error', (error) => {
				this.message = error.message || 'no message';
				this.update();
			});
		});

		this.on('unmount', () => {
			this.central.off('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-error>
