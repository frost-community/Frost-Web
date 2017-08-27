<frost-page-entrance>
	<div class='sections'>
		<section id='logo-section'>
			<div class='logo'>
				<img src='/images/apple-touch-icon.png' />
				<h1>Frost</h1>
			</div>
			<p>A cool and cool social-media.</p>
			<p>冷やし中華はじめました。</p>
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
			flex-direction: column;
			align-items: center;

			.sections {
				width: 390px;

				@include less-than($phone) {
					width: 100%;
				}
			}

			section {
				margin: 1.5rem 0;

				@include greater-than($phone) {
					border: 1px solid $border-color;
					border-radius: 6px;
					padding: 1.65rem;
					margin: 1rem;
				}
			}

			#logo-section {
				display: flex;
				flex-direction: column;
				align-items: center;
				border: none;

				p {
					font-size: 0.85rem;
					margin: 0;
				}

				.logo {
					display: flex;
					align-items: center;
					margin-bottom: 1rem;

					h1 {
						font-size: 2.8rem;
						margin: 0;
					}

					img {
						height: 2.3rem;
						margin-right: 0.1rem;
					}
				}
			}
		}
	</style>

	<script>
		const changedPageHandler = (pageId) => {
			if (pageId == 'entrance') {
				window.document.title = 'Frost';

				this.central.off('ev:changed-page', changedPageHandler);
			}
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-page', changedPageHandler);
		});
	</script>
</frost-page-entrance>
