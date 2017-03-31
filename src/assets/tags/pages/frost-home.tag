<frost-home>
	<div class="container">
		<header>
			<div class="row" style="margin-top: 20%">
				<div class="eight columns offset-by-three">
					<h1>
						<img class="logo-icon" src="../images/apple-touch-icon.png" />
						Frost
					</h1>
				</div>
			</div>
		</header>

		<main>
			<p>Homeです。</p>
			<button type="button" onclick={signout}>Logout</button>
		</main>

		<frost-footer />
	</div>
	<script>
		import fetchJson from '../../scripts/fetch-json';

		this.signout = () => {
			fetchJson('POST', '/signout', {
				_csrf: document.getElementsByName('_csrf').item(0).content
			}).then((res) => {
				document.cookie = "sid=; max-age=0";
				location.reload();
			})
			.catch(reason => {
				console.log('Sign out error: ' + reason);
			});
		};
	</script>
</frost-home>
