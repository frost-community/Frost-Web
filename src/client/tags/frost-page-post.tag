<frost-page-post>
	<div class='content'>
		<div class='main'>
			<p>ポストが表示されるページです。</p>
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
		const changedPageHandler = (pageId, params) => {
			if (pageId == 'post') {
				const postId = params[0];
				// TODO: ポストとその投稿者をフェッチ
				const screenName = 'hoge';
				window.document.title = `Frost - @${screenName}さんの投稿`;
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
