<frost-page-selector>
	<frost-page-dev if={ pageId == 'dev' } />
	<frost-page-entrance if={ pageId == 'entrance' } />
	<frost-page-error if={ pageId == 'error' } />
	<frost-page-home if={ pageId == 'home' } />
	<frost-page-post if={ pageId == 'post' } />
	<frost-page-user if={ pageId == 'user' } />
	<frost-page-userlist if={ pageId == 'userlist' } />

	<script>
		this.pageId = opts.dataPageId;

		this.on('change-page', (pageId) => {
			this.pageId = pageId;
			this.update();
		});
	</script>
</frost-page-selector>
