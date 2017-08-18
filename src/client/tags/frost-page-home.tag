<frost-page-home>
	<div class='content'>
		<div class='side'>
			<frost-home-logo />
			<hr />
			<frost-create-status-form />
			<frost-hint />
		</div>
		<div class='main'>
			<h1>タイムライン</h1>
			<frost-timeline data-name='home' />
		</div>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			> .content {
				@include responsive();

				> .side {
					@include less-than($tablet) {
						display: none;
					}

					.box {
						margin: 10px 0;
					}
				}

				> .side {
					width: 250px;
				}

				> .main {
					min-width: 300px;
					flex: 1;
				}

				> .side,
				> .main {
					h1 {
						font-size: 18px;
						margin-bottom: 10px;
					}
				}
			}
		}
	</style>

	<script>
		const changedPageHandler = (pageId) => {
			if (pageId == 'home') {
				window.document.title = 'Frost';

				this.central.off('ev:changed-page', changedPageHandler);
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-home>
