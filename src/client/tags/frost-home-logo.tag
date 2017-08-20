<frost-home-logo>
	<h1>
		<img class='icon' src='/images/apple-touch-icon.png' />
		Frost
	</h1>
	<p>
		ようこそ、{ user.name }さん。
	</p>

	<style>
		:scope {
			> h1 {
				font-size: 4.5rem !important;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0.5rem 0;

				> .icon {
					height: 5rem;
				}
			}
		}
	</style>

	<script>
		this.on('mount', () => {
		});
	</script>
</frost-home-logo>
