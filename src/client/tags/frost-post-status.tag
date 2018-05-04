<frost-post-status>
	<div class='side'><div class='icon' ref='icon'></div></div>
	<div class='main'>
		<div class='info'>
			<a href={ '/users/' + opts.status.user.screenName }>{ opts.status.user.name } @{ opts.status.user.screenName }</a>
			<time datetime={ getTime().format() } title={ getTime().format() }>{ getTime().fromNow() }</time>
		</div>
		<div class='text' ref='text'></div>
	</div>

	<style>
		@import "../styles/variables";

		:scope {
			display: flex;
			margin: 1rem 0;

			> .side {
				> .icon {
					margin-right: 0.8rem;
					background-color: hsla(0, 0%, 0%, 0.05);
					/* background-image: url(); */
					/* background-size: cover; */
					min-height: 3.75rem;
					min-width: 3.75rem;
					border-radius: 6px;
				}
			}

			> .main {
				width: 100%;
				word-break: break-word;

				> .info {
					display: flex;
					justify-content: space-between;

					> a {
						// テキストを上に詰める
						line-height: 100%;
						text-decoration-line: none;

						// テキストの省略
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					> time {
						color: $sub-text-color;
						font-size: 0.9rem;

						// 幅固定
						flex-shrink: 0;
					}
				}

				> .text {
					> p {
						margin-bottom: 0;

						.stroke {
							text-decoration: line-through;
						}

						.underline {
							text-decoration: underline;
						}
					}
				}
			}
		}
	</style>

	<script>
		this.moment = require('moment');
		const TextParser = require('../helpers/text-parser');

		getTime() {
			this.moment.locale("ja");
			return this.moment.unix(this.opts.status.createdAt);
		}

		compileText(text) {
			text = text
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/'/g, '&#039;')
				.replace(/"/g, '&quot;');

			const p = new TextParser(text);
			p.rule('url', text => {
				const match = text.match(/^(https?:\/\/[^\s/$.?#].[^\s]*)/i);
				if (!match) return null;

				return {
					size: match[0].length,
					target: match[1]
				};
			});
			p.rule('bold', text => {
				const match = text.match(/^\*\*([^\n]+?)\*\*/);
				if (!match) return null;
				return {
					size: match[0].length,
					text: match[1]
				};
			});
			p.rule('italic', text => {
				const match = text.match(/^\*([^\n]+?)\*/);
				if (!match) return null;

				return {
					size: match[0].length,
					text: match[1]
				};
			});
			p.rule('stroke', text => {
				const match = text.match(/^~~([^\n]+?)~~/);
				if (!match) return null;

				return {
					size: match[0].length,
					text: match[1]
				};
			});
			p.rule('underline', text => {
				const match = text.match(/^__([^\n]+?)__/);
				if (!match) return null;

				return {
					size: match[0].length,
					text: match[1]
				};
			});
			p.rule('inline-code', text => {
				const match = text.match(/^`([^\n]+?)`/);
				if (!match) return null;

				return {
					size: match[0].length,
					code: match[1]
				};
			});
			p.rule('break', text => {
				if (text[0] == '\n')
					return { size: 1 };
				else if (text[0] == '\r' && text[1] == '\n')
					return { size: 2 };
				else
					return null;
			});
			const tokens = p.parse();

			let compiledText = '<p>';
			for(const token of tokens) {
				if (token.type == 'plain') {
					compiledText += token.text;
				}
				else if (token.type == 'break') {
					compiledText += '</p><p>';
				}
				else if (token.type == 'url') {
					compiledText += `<a href="${token.target}" target="_blank">${token.target}</a>`;
				}
				else if (token.type == 'bold') {
					compiledText += `<b>${token.text}</b>`;
				}
				else if (token.type == 'italic') {
					compiledText += `<i>${token.text}</i>`;
				}
				else if (token.type == 'stroke') {
					compiledText += `<span class="stroke">${token.text}</span>`;
				}
				else if (token.type == 'underline') {
					compiledText += `<span class="underline">${token.text}</span>`;
				}
				else if (token.type == 'inline-code') {
					compiledText += `<code>${token.code}</code>`;
				}
			}
			compiledText += '</p>';

			return compiledText;
		}

		this.on('mount', () => {
			this.refs.text.innerHTML = this.compileText(this.opts.status.text);
			this.refs.icon.style.backgroundImage = `url(https://placeimg.com/${this.refs.icon.offsetWidth * window.devicePixelRatio}/${this.refs.icon.offsetHeight * window.devicePixelRatio}/people/grayscale?${opts.status.user.screenName})`;

			// 定期的に画面を更新
			setInterval(() => {
				this.update();
			}, 60 * 1000);
		});
	</script>
</frost-post-status>
