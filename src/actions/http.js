
export const createOptions = (type, body) => {
	return {
		method: type,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			// 'Accept': 'application/json'
		},
		body: body
	};
};

export const request = (url, options) => {
	return fetch(url, options).then(result => {
		if (!result.ok) {
			return {status: 'fail'};
		}
		if (result.status === 403) {
			return {status: 'fail'};
		} else {
			return result.json();
		}
	});
};

export const responseTimeout = (value) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			reject('timeout');
		}, value);
	});
};

export const sendRequest = (url, options) => {
	return Promise.race([responseTimeout(5000), request(url, options)])
		.then(result => {
			return result;
		})
		.catch(() => {
			return {status: 'fail', message: 'Something went wrong, please try again later'};
		});
};
