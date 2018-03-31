class HttpServerError extends Error {
	constructor(status, message, isJson) {
		super(message);
		this.status = status || 500;
		this.isJson = isJson != null ? isJson : false;
	}
}

module.exports = HttpServerError;
