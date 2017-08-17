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
			const rest = rest => {
				if (rest.request.method == method && rest.request.endpoint == endpoint) {
					if (rest.success) {
						if (rest.statusCode < 400) {
							resolve(rest);
						}
						else {
							reject(new Error(`api error: failed to fetch data. (Status: ${rest.statusCode}) ${rest.response.message}`));
						}
					}
					else {
						reject(new Error(`internal error: failed to fetch data. ${rest.message}`));
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
			this.connection.sendEvent('rest', {request: request});
		});
	}
}

module.exports = StreamingRest;
