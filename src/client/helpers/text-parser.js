class TextParser {
	constructor(text) {
		this.text = text;
		this._rules = [];
		this._offset = 0;
		this._plain = '';
		this.forward(0);
	}

	rule(typeName, rule) {
		this._rules.push({ type: typeName, predicate: rule });
	}

	forward(count) {
		this._offset += count;
		this.currentText = this.text.substr(this._offset);
	}

	get _isEnd() {
		return this.text.length < this._offset + 1;
	}

	parse() {
		const tokens = [];

		const addPlain = () => {
			if (this._plain.length > 0) {
				// add plain token
				tokens.push({
					text: this._plain,
					type: 'plain'
				});
				this._plain = '';
			}
		};

		while (!this._isEnd) {
			let token;
			for (const rule of this._rules) {
				token = rule.predicate(this.currentText);
				if (token) {
					token.type = rule.type;
					break;
				}
			}

			if (token) {
				addPlain();
				// add token
				tokens.push(token);
				this.forward(token.size);
				delete token.size;
			}
			else {
				// forward plain token
				this._plain += this.currentText[0];
				this.forward(1);
			}
		}
		addPlain();

		return tokens;
	}
}
module.exports = TextParser;
