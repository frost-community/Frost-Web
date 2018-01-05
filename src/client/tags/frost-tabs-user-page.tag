<frost-tabs-user-page>
	<ul>
		<li each={ tabs } class={ tab: true, active: (parent.selectedTab.id == id) }>
			<a onclick={ parent.changeTab }>{ text }</a>
		</li>
	</ul>
	<div class='content' show={ selectedTab.id == 'timeline' }>
		<frost-timeline data-name='user', data-user-id={ user.id } />
	</div>
	<div class='content' show={ selectedTab.id == 'followings' }>
		<ul>
			<li each={ user in followings }>
				<a href={ '/users/'+user.screenName }>{ user.name } @{ user.screenName }</a>
			</li>
		</ul>
	</div>
	<div class='content' show={ selectedTab.id == 'followers' }>
		<ul>
			<li each={ user in followers }>
				<a href={ '/users/'+user.screenName }>{ user.name } @{ user.screenName }</a>
			</li>
		</ul>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			/*
			position: fixed;
			width: 100%;
			background-color: hsla(216, 100%, 98%, 0.85);
			box-shadow: 0 0 6px 0 hsla(0, 0%, 0%, 0.5);
			overflow: hidden;
			*/

			> ul {
				@include responsive();

				list-style-type: none;
				align-items: center;
				height: 12*3px;

				@include less-than($tablet) {
					overflow-x: auto;
					overflow-y: hidden;
				}

				> li {
					margin: 0;
					height: 100%;
					min-width: 75px;
					width: 110px;

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

			> .content {
				margin: 1rem 0;
			}
		}
	</style>

	<script>
		const StreamingRest = require('../helpers/StreamingRest');

		if (this.opts.dataUser == null) {
			throw new Error('data-user property is required');
		}

		this.followings = [];
		this.followers = [];

		this.user = this.opts.dataUser;

		this.tabs = [
			{ id: 'timeline', text: 'タイムライン' },
			{ id: 'followings', text: 'フォロー' },
			{ id: 'followers', text: 'フォロワー' }
		];
		this.selectedTab = this.tabs[0];

		changeTab(e) {
			this.selectedTab = e.item;
		}

		this.on('mount', async () => {
			const streamingRest = new StreamingRest(this.webSocket);

			let restFollowings, restFollowers;
			[restFollowings, restFollowers] = await Promise.all([
				streamingRest.requestAsync('get', `/users/${this.user.id}/followings`, { query: { limit: 100 } }),
				streamingRest.requestAsync('get', `/users/${this.user.id}/followers`, { query: { limit: 100 } })
			]);
			this.followings = restFollowings.response.users;
			this.followers = restFollowers.response.users;
		});
	</script>
</frost-tabs-user-page>
