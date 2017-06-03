<frost-logout-button>
	<a href='javascript:void(0)' onclick={ signout }>Logout</a>

	<script>
		import fetchJson from '../scripts/fetch-json';
		this.csrfToken = document.getElementsByName('_csrf').item(0).content;

		this.signout = () => {
			fetchJson('DELETE', '/session', {
				_csrf: this.csrfToken
			}).then((res) => {
				location.reload();
			})
			.catch(reason => {
				console.log('Sign out error: ' + reason);
			});
		};
	</script>
</frost-logout-button>
