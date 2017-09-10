<frost-home-logo>
	<h1>
		<div class='icon'>
			<img src='/images/apple-touch-icon.png' />
		</div>
		Frost
	</h1>
	<p>
		ようこそ、{ user.name }さん。
	</p>

	<style>
		:scope {
			> h1 {
				font-size: 2.5rem !important;
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 0.5rem 0 2rem;

				> .icon {
					width: 1em;
					height: 1em;

					> img {
						width: 100%;
					}
				}
			}

			> p {
				line-height: 1;
			}
		}
	</style>

	<script>
		this.on('mount', () => {
		});
	</script>
</frost-home-logo>
