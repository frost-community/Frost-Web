class StreamingRest {
	constructor(webSocketConnection) {
		if (webSocketConnection == null) {
			throw new ReferenceError('1st argument "webSocketConnection" is a null reference');
		}
		this.connection = webSocketConnection;
	}

	requestAsync(method, endpoint, requestContent, apiVersion, timeoutInterval) {
		return new Promise((resolve, reject) => {
			if (method == null || endpoint == null) {
				reject(new ReferenceError('missing arguments'));
			}
			requestContent = requestContent || {};
			apiVersion = apiVersion || 1;
			timeoutInterval = 3000;

			// request timeout
			const timeout = setTimeout(() => {
				reject(new Error('response timeout'));
			}, timeoutInterval);

			// handler
			const rest = (rest) => {
				if (rest.request.method == method && rest.request.endpoint == endpoint) {
					if (rest.success) {
						resolve(rest);
					}
					else {
						reject(new Error(rest.message));
					}

					// disposings
					this.connection.off('rest', rest);
					clearTimeout(timeout);
				}
			};
			this.connection.on('rest', rest);

			// build request
			let request = {
				method: method,
				endpoint: endpoint,
				headers: {
					'x-api-version': apiVersion
				}
			};
			request = Object.assign(request, requestContent);

			// send request
			this.connection.sendEvent('rest', request);
		});
	}
}

module.exports = StreamingRest;
