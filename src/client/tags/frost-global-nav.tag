<frost-global-nav role='banner'>
	<nav>
		<ul>
			<li class={ active: activeId == (login ? 'home' : 'entrance') }>
				<a href='/'>{ login ? 'Home' : 'Entrance' }</a>
			</li>
			<li if={ login } class={ active: activeId == 'userlist'}>
				<a href='/userlist'>UserList</a>
			</li>
			<li class={ active: activeId == 'dev' }>
				<a href='/dev'>DevCenter</a>
			</li>
			<virtual if={ login }>
				<li style='margin-left: auto'>
					<a href={ '/users/' + user.screenName }>@{ user.screenName }</a>
				</li>
				<li>
					<frost-logout-button />
				</li>
			</virtual>
		</ul>
	</nav>

	<style>
		@import "../styles/variables";

		:scope {
			position: fixed;
			width: 100%;
			background-color: hsla(216, 100%, 98%, 0.85);
			box-shadow: 0 0 6px 0 hsla(0, 0%, 0%, 0.5);
			overflow: hidden;

			ul {
				@include responsive();

				padding: 0 1rem;
				list-style-type: none;
				align-items: center;
				height: 15*3px;

				@include less-than($tablet) {
					overflow-x: auto;
					overflow-y: hidden;
				}

				> li {
					margin: 0;
					height: 100%;
					min-width: 85px;
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
						font-size: 15px;
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
		const changedLoginStatusEventHandler = (login) => {
			this.login = login;
			this.update();
		};

		const changePageHandler = (pageId) => {
			this.activeId = pageId;
			this.update();
		};

		this.on('mount', () => {
			this.central.on('ev:changed-login-status', changedLoginStatusEventHandler);
			this.central.on('change-page', changePageHandler);

			this.login = this.getLogin();
		});

		this.on('unmount', () => {
			this.central.off('ev:changed-login-status', changedLoginStatusEventHandler);
			this.central.off('change-page', changePageHandler);
		});
	</script>
</frost-global-nav>
