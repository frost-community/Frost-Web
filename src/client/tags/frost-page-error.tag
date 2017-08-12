<frost-page-error>
	<div class='content'>
		<div class='main'>
			<h3>Sorry... An error has occurred.</h3>
			<p>Message: { message }</p>
		</div>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			> .content {
				@include responsive();
			}
		}
	</style>

	<script>
		const el = document.getElementsByName('frost-error').item(0);
		this.message = el != null ? el.content : 'no message';

		this.central.on('change-error', (error) => {
			this.message = error.message || 'no message';
			this.update();
		});
	</script>
</frost-page-error>
