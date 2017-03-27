<frost-app>
	<frost-entrance-page if={page=='entrance'} />
	<frost-home-page if={page=='home'} />
	<button onclick={click} />

	this.state = true;
	this.click = (e) => {
		this.state = !this.state;
		this.page = this.state ? 'home' : 'entrance';
	};
	this.click();

	<style>
		@import './styles/normalize.css';
		@import './styles/skeleton.css';
		@import './styles/custom.css';
		@import 'http://fonts.googleapis.com/css?family=Raleway:400,300,600';
	</style>
</frost-app>
