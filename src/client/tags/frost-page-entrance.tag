<frost-page-entrance>
	<div class='content'>
		<section id='logo-section'>
			<h1>
				<img class='logo-icon' src='/images/apple-touch-icon.png' />
				Frost
			</h1>
			<p>
				A cool and cool social-media.
				<br />
				冷やし中華はじめました。
			</p>
		</section>

		<section>
			<frost-login-form />
		</section>

		<section>
			<frost-signup-form />
		</section>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			.logo-icon {
				height: 3rem;

				@media (min-width: $phone) {
					height: 4rem;
				}
			}

			> .content {
				@include responsive();

				align-items: flex-start;

				@media (min-width: $phone) {
					align-items: center;
				}

				> section {
					padding: 3rem;
					margin: 1rem;

					@media (min-width: $phone) {
						width: 370px;
						border: 1px solid $border-color;
						border-radius: 4px;
					}
				}

				#logo-section {
					align-self: center;
					text-align: center;
					border: none;
				}
			}
		}
	</style>

	<script>
		const changedPageHandler = (pageId) => {
			if (pageId == 'entrance') {
				window.document.title = 'Frost';
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
</frost-page-entrance>
