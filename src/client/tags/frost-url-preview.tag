<frost-url-preview>
	<ul if={ details.length > 0 }>
		<li each={ detail in details } >
			<h1>{ detail.title }</h1>
			<div if={ detail.description }>{ detail.description }</div>
		</li>
	</ul>

  <style>
    ul {
      line-style: none;
      padding: 0;
    }
  </style>

	<script>
		this.details = [];

		this.retriver = (urls) => {
			urls.forEach(url => {
				const analyzer = 'https://analizzatore.prezzemolo.ga/?url=' + encodeURIComponent(url);
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
