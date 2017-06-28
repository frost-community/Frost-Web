<frost-header>
	<ul>
		<li><a href='/'>Home</a></li>
		<li><a href='/dev' target='_blank'>Developers Center</a></li>
		<virtual if={ userId != null }>
			<li><a href={ '/users/' + user.screenName } target='_blank'>@{ user.screenName }</a></li>
			<li><frost-logout-button /></li>
		</virtual>
	</ul>

	<script>
		this.on('mount', () => {
		});
	</script>
</frost-header>
