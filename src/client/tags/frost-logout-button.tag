<frost-logout-button>
	<a href='javascript:void(0)' onclick={ signout }>Logout</a>

	<script>
		const fetchJson = require('../helpers/fetch-json');

		signout() {
			fetchJson('DELETE', '/session', {
				_csrf: this.csrfToken
			}).then((res) => {
				location.reload();
			})
			.catch(reason => {
				console.log('Sign out error: ' + reason);
			});
		}
	</script>
</frost-logout-button>
