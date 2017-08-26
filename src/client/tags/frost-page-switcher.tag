<frost-page-switcher>
	<frost-page-dev if={ pageId == 'dev' } />
	<frost-page-entrance if={ pageId == 'entrance' } />
	<frost-page-error if={ pageId == 'error' } />
	<frost-page-home if={ pageId == 'home' } />
	<frost-page-post if={ pageId == 'post' } />
	<frost-page-user if={ pageId == 'user' } />
	<frost-page-userlist if={ pageId == 'userlist' } />

	<style>
		@import "../styles/variables";

		:scope {
			display: block;
			padding-top: 15*3px;

			> * {
				@include responsive();

				padding: 1.5rem;

				@include less-than($tablet) {
					padding: 1rem;
				}


				> :not(:last-child) {
					margin-right: 1.1rem;
				}
			}
		}
	</style>

	<script>
		const changePageHandler = (pageId, params) => {
			this.pageId = '';
			this.update();
			this.pageId = pageId;
			this.update();
			this.central.trigger('ev:changed-page', pageId, params);
			console.log('page:', pageId);
		};

		this.on('mount', () => {
			this.central.on('change-page', changePageHandler);
		});

		this.on('unmount', () => {
			this.central.off('change-page', changePageHandler);
		});
	</script>
</frost-page-switcher>
