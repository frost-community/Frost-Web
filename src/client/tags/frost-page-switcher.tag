<frost-page-switcher>
	<frost-page-dev if={ pageId == 'dev' } />
	<frost-page-entrance if={ pageId == 'entrance' } />
	<frost-page-error if={ pageId == 'error' } />
	<frost-page-home if={ pageId == 'home' } />
	<frost-page-post if={ pageId == 'post' } />
	<frost-page-user if={ pageId == 'user' } />
	<frost-page-userlist if={ pageId == 'userlist' } />

	<style>
		:scope {
			> * > .content {
				padding-top: 6.5rem !important;

				> :not(:last-child) {
					margin-right: 2rem;
				}
			}
		}
	</style>

	<script>
		this.on('mount', () => {
			this.central.on('change-page', (pageId) => {
				this.pageId = pageId;
				this.update();
				this.central.trigger('ev:changed-page', pageId);
			});
		});
	</script>
</frost-page-switcher>
