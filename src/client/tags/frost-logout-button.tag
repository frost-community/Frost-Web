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
					location.reload();
					return;
				}
				else {
					const json = await res.json();
					alert(json.error.message);
				}
			})
			.catch((reason) => {
				console.log('Sign out error: ' + reason);
				alert('エラー: ログアウトに失敗しました。' + reason);
			});
		}
	</script>
</frost-logout-button>
