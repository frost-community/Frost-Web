<frost-applications>
	<ul if={ applications.length != 0 }>
		<li each={ applications }>
			<p>アプリケーション名: { name }</p>
			<p>説明: { description }</p>
			<p>アプリケーションID: { id }</p>
			<p>権限:</p><!-- Permissions -->
			<ul>
				<li each={ permission ,i in permissions }>
					{ permission }
				</li>
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
		const StreamingRest = require('../helpers/StreamingRest');
		this.applications = [];
		this.loading = true;
		this.error = false;

		const centralAddApplicationHandler = (data) => {
			this.applications.push(data.application);
			this.update();
		};

		this.on('mount', () => {
			this.central.on('add-application', centralAddApplicationHandler);

			(async () => {
				const streamingRest = new StreamingRest(this.webSocket);
				const rest = await streamingRest.requestAsync('get', '/applications');
				if (rest.response.applications == null) {
					if (rest.statusCode != 404) {
						alert(`api error: failed to fetch list of appliations. ${rest.response.message}`);
						return;
					}
					rest.response.applications = [];
				}
				this.applications = rest.response.applications;
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
