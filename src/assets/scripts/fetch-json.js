module.exports = (method, url, body) => {
	const headers = new Headers();
	headers.append('Content-Type', 'application/json');

	return fetch(url, {
		method: method,
		body: JSON.stringify(body),
		headers: headers,
		mode: 'same-origin',
		credentials: 'include'
	});
};
