class StreamingRest {
	constructor(webSocketConnection) {
		if (webSocketConnection == null) {
			throw new ReferenceError('1st argument "webSocketConnection" is a null reference');
		}
		this.connection = webSocketConnection;
	}

	requestAsync(method, endpoint, requestContent, apiVersion) {
		return new Promise((resolve, reject) => {
			requestContent = requestContent || {};
			apiVersion = apiVersion || 1;

			const handler = rest => {
				if (rest.request.method == method && rest.request.endpoint == endpoint) {
					if (rest.success) {
						if (rest.response.user != null) {
							resolve(rest);
						}
						reject(new Error(`api error: failed to fetch user data. ${rest.response.message}`));
					}
					reject(new Error(`internal error: failed to fetch user data. ${rest.message}`));

					this.connection.off('rest', handler);
				}
			};
			this.connection.on('rest', handler);

			let request = {
				method: method,
				endpoint: endpoint,
				headers: {
					'x-api-version': apiVersion
				}
			};
			request = Object.assign(request, requestContent);
			this.connection.sendEvent('rest', {request: request});
		});
	}
}

module.exports = StreamingRest;
