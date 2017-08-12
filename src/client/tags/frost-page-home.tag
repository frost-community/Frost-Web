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
				@include responsive(row);

				> .side {
					@media (max-width: $tablet - 1px) {
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
	</script>
</frost-page-home>
