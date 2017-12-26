<frost-page-home>
	<div class='side'>
		<frost-home-logo />
		<frost-form-create-status />
		<frost-hint />
	</div>
	<div class='main'>
		<h6>{ this.timelineType == 'general' ? 'ジェネラル' : '' } タイムライン</h6>
		<frost-timeline if={ mountTimeline } data-name={ timelineType } />
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			> :not(:last-child) {
				margin-right: 2.25rem;

				@include less-than($desktop) {
					margin-right: 2rem;
				}
			}

			> .side {
				> :not(:last-child) {
					display: block;
					margin-bottom: 2rem;
				}

				@include less-than($tablet) {
					display: flex;
					flex-direction: column-reverse;
					margin-right: 0;
				}

				@include greater-than($tablet) {
					width: 250px;
				}
			}

			> .main {
				flex: 1;
			}

			> .side,
			> .main {
				> h1 {
					margin: 0.5rem 0;
				}
			}

			@include less-than($tablet) {
				flex-direction: column;
			}
		}
	</style>

	<script>
		this.mountTimeline = false;
		this.timelineType = 'home';

		const changedPageHandler = (pageId, params) => {
			if (pageId == 'home') {
				window.document.title = 'Frost';

				if (params.timelineType == 'general') {
					this.timelineType = 'general';
				}
				this.mountTimeline = true;

				this.central.off('ev:changed-page', changedPageHandler);
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-home>
