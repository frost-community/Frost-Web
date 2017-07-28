<frost-header role='banner'>
	<nav>
		<ul>
			<li ref='home'><a href='/'>Home</a></li>
			<li ref='dev'><a href='/dev' target='_blank'>DevCenter</a></li>
			<virtual if={ userId != null }>
				<li ref='userlist'><a href='/userlist' target='_blank'>UserList</a></li>
				<li style='margin-left: auto'><a href={ '/users/' + user.screenName } target='_blank'>@{ user.screenName }</a></li>
				<li><frost-logout-button /></li>
			</virtual>
		</ul>
	</nav>

	<style>
		@import "../styles/variables";

		:scope {
			position: fixed;
			width: 100%;
			background-color: hsla(216, 100%, 98%, 0.85);
			box-shadow: 0px 0px 6px 0px hsla(0, 0%, 0%, 0.5);
			overflow: hidden;

			ul {
				@include responsive(row);

				flex-direction: row;
				list-style-type: none;
				align-items: center;
				height: 45px;

				@media (max-width: $tablet - 1px) {
					overflow-x: auto;
					overflow-y: hidden;
				}

				> li {
					margin: 0;
					height: 100%;
					min-width: 75px;
					width: 100px;

					a {
						height: 100%;
						display: flex;
						align-items: center;
						border-bottom: 3px solid hsla(0, 0%, 0%, 0);
						justify-content: center;
						text-decoration-line: none;
						color: hsla(0, 0%, 0%, 0.7);
						padding-top: 3px;
					}
				}

				> li.active {
					a {
						border-bottom-color: hsl(194, 76%, 49%);
						color: hsl(194, 76%, 49%);
					}
				}
			}
		}
	</style>

	<script>
		this.on('mount', () => {
			const activeItemName = this.opts.dataActive;
			const activatables = ['home', 'dev', 'userlist'];

			if (activatables.indexOf(activeItemName) != -1) {
				this.refs[activeItemName].classList.add('active');
			}
		});
	</script>
</frost-header>
