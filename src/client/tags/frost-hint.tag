<frost-hint>
	<div>
		<i class='fa fa-info-circle'></i>
		<p onclick={ change } ref='text'></p>
	</div>

	<style>
		:scope {
			> div {
				display: flex;
				align-items: center;

				> * {
					margin: 0;
				}
				> i {
					margin-right: 0.8rem;
				}
				> p {
					font-size: 1.2rem;
				}
			}
		}
	</style>

	<script>
		this.on('mount', () => {
			this.change = () => {
				this.refs.text.innerHTML = '<a href=\'/userlist\' target=\'_blank\'>ユーザーリスト</a>からユーザーを探してフォローしてみましょう';
			};

			this.change();
		});
	</script>
</frost-hint>
