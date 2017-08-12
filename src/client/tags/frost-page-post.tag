<frost-page-post>
	<div class='content'>
		<div class='main'>
			post
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
			if (pageId == 'post') {
				window.document.title = 'Frost';
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
</frost-page-post>
