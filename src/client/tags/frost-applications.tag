<frost-applications>
	<ul if={ applications.length != 0 }>
		<li each={ app in applications }>
			<p>アプリケーション名: { app.name }</p>
			<p>説明: { app.description }</p>
			<h3>OAuth 2.0</h3>
			<p>Client ID: { app.id }</p>
			<p onclick={ parent.toggleSecret }>Client Secret: { (app.isShowSecret ? app.secret : 'クリックして表示') }</p>
			<p>Scopes(利用可能なアクセス権):</p>
			<ul>
				<li each={ scope in app.scopes }>
					{ scope }
				</li>
				<p if={ app.scopes.length == 0 }>利用可能なアクセス権はありません。</p>
			</ul>
		</li>
	</ul>
	<p if={ loading }>読み込み中...</p>
	<p if={ error }>アプリケーションリストの取得に失敗しました。</p>
	<p if={ !loading && applications.length == 0 }>あなたはアプリケーションを持っていません。</p><!-- You don't have any applications -->

	<style>
		@import "../styles/variables";

		:scope {
			> ul > li {
				@include box();
				list-style-type: none;

				&:not(:last-child) {
					border-bottom: 1px solid hsl(0, 0%, 88%);
				}

				> p {
					margin-bottom: 0.8rem;
				}
			}
		}
	</style>

	<script>
		this.applications = [];
		this.loading = true;
		this.error = false;

		const centralAddApplicationHandler = (data) => {
			data.application.isShowSecret = false;
			data.application.secret = 'hoge';

			this.applications.push(data.application);
			this.update();
		};

		this.on('mount', () => {
			this.central.on('add-application', centralAddApplicationHandler);

			this.toggleSecret = (ev) => {
				ev.item.app.isShowSecret = !ev.item.app.isShowSecret;
				this.update();
			};

			(async () => {
				const rest = await this.streamingRest.request('get', '/applications');
				if (rest.response.applications == null) {
					if (rest.statusCode != 204) {
						alert(`api error: failed to fetch list of appliations. ${rest.response.message}`);
						return;
					}
					rest.response.applications = [];
				}
				const apps = rest.response.applications.map(app => {
					app.isShowSecret = false;
					app.secret = 'hoge';
					return app;
				});
				this.applications = apps;
				this.loading = false;
				this.update();
			})().catch((err) => {
				console.error(err);
				this.loading = false;
				this.error = true;
				this.update();
			});
		});

		this.on('unmount', () => {
			this.central.off('add-application', centralAddApplicationHandler);
		});
	</script>
</frost-applications>
