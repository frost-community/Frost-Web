class StreamingRest {
	constructor(webSocketConnection) {
		if (webSocketConnection == null) {
			throw new ReferenceError('1st argument "webSocketConnection" is a null reference');
		}
		this.connection = webSocketConnection;
	}

	request(method, endpoint, requestContent, timeoutInterval) {
		return new Promise((resolve, reject) => {
			if (method == null || endpoint == null) {
				reject(new ReferenceError('missing arguments'));
			}
			requestContent = requestContent || {};
			timeoutInterval = 3000;

			// request timeout
			const timeout = setTimeout(() => {
				reject(new Error('response timeout'));
			}, timeoutInterval);

			// handler
			const restHandler = (rest) => {
				if (rest.success == true) {
					if (rest.request.method == method && rest.request.endpoint == endpoint) {
						if (rest.success) {
							resolve(rest);
						}
						else {
							reject(new Error(rest.message));
						}

						// disposings
						this.connection.removeListener('rest', restHandler);
						clearTimeout(timeout);
					}
				}
				else {
					reject(new Error(rest.message));

					// disposings
					this.connection.removeListener('rest', restHandler);
					clearTimeout(timeout);
				}
			};
			this.connection.on('rest', restHandler);

			// build request
			let request = {
				method: method,
				endpoint: endpoint
			};
			request = Object.assign(request, requestContent);

			// send request
			this.connection.sendEvent('rest', request);
		});
	}
}
module.exports = StreamingRest;
