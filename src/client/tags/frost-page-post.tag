<frost-page-post>
	<div class='main'>
		<p>ポストが表示されるページです。</p>
	</div>

	<style>
		@import "../styles/variables";

		:scope {

		}
	</style>

	<script>
		const changedPageHandler = (pageId, params) => {
			if (pageId == 'post') {
				const postId = params.postId;
				// TODO: ポストとその投稿者をフェッチ
				const screenName = 'hoge';
				window.document.title = `Frost - @${screenName}さんの投稿`;

				this.central.off('ev:changed-page', changedPageHandler);
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-post>
