<frost-page-home>
	<div class='side'>
		<frost-home-logo />
		<hr />
		<frost-create-status-form />
		<frost-hint />
	</div>
	<div class='main'>
		<h6>{ this.timelineType == 'general' ? 'ジェネラル' : '' } タイムライン</h6>
		<frost-timeline if={ mountTimeline } data-name={ timelineType } />
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			> .side {
				@include less-than($tablet) {
					display: none;
				}

				.box {
					margin: 0.5rem 0;
				}
			}

			> .side {
				width: 250px;
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
