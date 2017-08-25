<frost-url-preview>
	<frost-url-preview-content if={ details.length > 0 } each={ detail in details } >

	<script>
		this.details = [];

		this.retriver = (urls) => {
			urls.forEach(url => {
				const analyzer = `https://analizzatore.prezzemolo.ga/?url=${encodeURIComponent(url)}&lang=ja`;
				fetch(analyzer).then(response => {
					if (!response.ok) throw new Error('received status code greater than 400.');
					response.json().then(detail => {
						this.details.push(detail);
						this.update();
					});
				}).catch(e => {
					console.error(e);
				})
			})
		}

		this.on('mount', () => {
			this.retriver(this.opts.urls);
		});
	</script>
</frost-url-preview>

<frost-url-preview-content>
	<a href={ detail.originUrl }>
		<div class='title'>{ detail.title }</div>
		<div class='description' if={ detail.description }>{ detail.description }</div>
	</a>

	<style>
		.title {
			font-size: 1em;
			font-weight: bold;
		}
		.description {
			font-size: 0.9em;
		}
	</style>
</frost-url-preview-content>
