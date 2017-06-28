<frost-header>
	<ul>
		<li><a href='/'>Home</a></li>
		<li><a href='/dev' target='_blank'>Developers Center</a></li>
		<virtual if={ userId != null }>
			<li><a href={ '/users/' + user.screenName } target='_blank'>@{ user.screenName }</a></li>
			<li><frost-logout-button /></li>
		</virtual>
	</ul>

	<style>
		@import "../styles/variables";

		:scope {
			position: fixed;
			width: 100%;
			top: 0;
			background-color: hsla(216, 100%, 98%, 0.85);
			box-shadow: 0px 0px 6px 0px hsla(0, 0%, 0%, 0.5);

			ul {
				@include responsive(row);

				flex-direction: row;
				list-style-type: none;
				align-items: center;
				height: 50px;
				margin: 0 auto;

				> li {
					padding: 0 5px;
					margin-bottom: 0;

					button {
						margin-bottom: 0;
					}
				}
			}
		}
	</style>

	<script>
		this.on('mount', () => {
		});
	</script>
</frost-header>
