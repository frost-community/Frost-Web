/** reCAPTCHAが利用可能になるまで待機します */
module.exports = (siteKey) => new Promise((resolve) => {
	const t = setInterval(() => {
		if (siteKey == null || typeof grecaptcha != 'undefined') {
			clearInterval(t);
			resolve();
		}
	}, 50);
});
