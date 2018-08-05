<frost-logout-button>
	<a href='javascript:void(0)' onclick={ signout }>ログアウト</a> <!-- Sign out -->

	<script>
		const fetchJson = require('../helpers/fetch-json');

		signout() {
			fetchJson('DELETE', '/session', {
				_csrf: this.csrf
			})
			.then(async (res) => {
				if (res.ok) {
					localStorage.removeItem('accessToken');
					location.reload();
					return;
				}
				else {
					const json = await res.json();
					alert('ログアウトに失敗しました: ' + json.error.message);
				}
			})
			.catch((reason) => {
				alert('ログアウトに失敗しました: ' + reason);
			});
		}
	</script>
</frost-logout-button>
