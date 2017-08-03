<frost-appauth-form>
	<div class='parent'>
		<div class='child'>
			<h6>アプリケーションがあなたのアカウントにアクセスすることを承認しますか？</h6>
			<h6>要求されている権限</h6>
			<ul>
				<li>ステータスの投稿</li>
			</ul>

			<div class='controls'>
				<button class='accept button-primary' onclick={ accept }>承認</button>
				<button class='reject' onclick={ reject }>拒否</button>
			</div>
		</div>
	</div>
	<div class={ 'modal-outer': true, opaque: modalOpaque } onclick={ cancel } show={ modalShow }>
		<div class='modal'>
			<header>
				<h6>確認</h6>
				<div class='close' onclick={ cancel }><i class='fa fa-close'></i></div>
			</header>
			<div class='content'>
				<p>ロボットによるアクセスではないことを確認します。</p>
				<div id='recaptcha-appauth'></div>
				<button class='button-primary'>確認</button>
			</div>
		</div>
	</div>

	<style>
		:scope {
			#recaptcha-appauth {
				user-select: none;
			}

			> .parent {
				/*
				display: flex;
				justify-content: center;
				margin: 3rem 0;
				*/

				> .child {
					padding: 2rem;
					border-radius: 0.5rem;
					border: 1px solid hsla(0, 0%, 0%, 0.15);

					.controls {
						display: flex;
						flex-direction: row-reverse;

						.accept {
							margin: 0 0 0 1rem;
						}
						.reject {
							margin: 0;
						}
					}
				}
			}

			.modal-outer {
				position: fixed;
				top: 0;
				left: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100%;
				width: 100%;
				z-index: 1;
				background-color: hsla(0, 0%, 0%, 0.3);
				transition: 300ms ease;
				opacity: 0;

				&.opaque {
					opacity: 1;
				}

				> .modal {
					background-color: hsl(0, 0%, 100%);
					border-radius: 0.5rem;

					> header {
						display: flex;
						justify-content: space-between;

						> * {
							user-select: none;
						}

						> h6 {
							margin-bottom: 0;
							padding: 0.75rem 0.75rem 0.75rem 2rem;
							cursor: default;
						}

						> .close {
							padding: 0 2rem;
							font-size: 1.75rem;
							display: flex;
							align-items: center;
							cursor: pointer;

							&:hover {
								background-color: hsl(0, 0%, 80%);
								border-radius: 0 0.5rem 0 0;
							}
						}
					}

					> .content {
						padding: 1rem 2rem 1rem;
					}
				}
			}
		}
	</style>

	<script>
		this.modalOpaque = false;
		this.modalShow = false;

		//this.csrfToken
		//grecaptcha.getResponse()

		this.accept = () => {
			this.modalShow = true;
			this.update();

			setTimeout(() => {
				this.modalOpaque = true;
				this.update();
			}, 0);

		};

		this.reject = () => {

		};

		this.cancel = (e) => {
			if (e.target.className.indexOf('modal-outer') == -1 && e.target.className.indexOf('close') == -1) {
				return;
			}

			this.modalOpaque = false;
			this.update();

			setTimeout(() => {
				grecaptcha.reset();

				this.modalShow = false;
				this.update();
			}, 300);

		};

		this.on('mount', () => {
			grecaptcha.render('recaptcha-appauth', {
				sitekey: this.siteKey
			});
		});
	</script>
</frost-appauth-form>
