<frost-logout-button>
	<a href='javascript:void(0)' onclick={ signout }>ログアウト</a> <!-- Sign out -->

	<script>
		const fetchJson = require('../helpers/fetch-json');

		signout() {
			fetchJson('DELETE', '/session', {
				_csrf: this.csrf
			}).then((res) => {
				location.reload();
			})
			.catch(reason => {
				console.log('Sign out error: ' + reason);
				alert('エラー: ログアウトに失敗しました。' + reason);
			});
		}
	</script>
</frost-logout-button>
