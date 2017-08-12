<frost-page-userlist>
	<div class='content'>
		<div class='main'>
			userlist
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
			if (pageId == 'userlist') {
				window.document.title = 'Frost - ユーザーの一覧';
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
</frost-page-userlist>
