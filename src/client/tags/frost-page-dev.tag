<frost-page-dev>
	<div class='content'>
		<div class='main'>
			dev
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
				console.log('title changed');
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});

		this.on('unmount', () => {
			this.central.off('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-dev>
