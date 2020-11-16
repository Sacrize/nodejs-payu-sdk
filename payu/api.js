module.exports = {

    request(method, url, body, headers) {
        body = body || {};
        headers = headers || {};
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(body);
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                    ...headers,
                },
            }
            const lib = url.startsWith('https') ? require('https') : require('http');
            const req = lib.request(url, options, res => {
                if (res.statusCode === 404) {
                    return reject(new Error('Failed to load page, status code: ' + res.statusCode));
                }
                const content = [];
                res.on('data', chunk => content.push(chunk));
                res.on('end', () => {
                    let raw = content.join('');
                    let json = raw.replace(/,(?=\s*?[}\]])/g, ''); // fix trailing comma
                    json = JSON.parse(json);
                    if ((res.statusCode < 200 || res.statusCode > 302)) {
                        let error = new Error('Api error status: ' + res.statusCode);
                        if (json['status']) {
                            error.reason = json['status'];
                        } else if (json['error']) {
                            error.reason = json['error'];
                        }
                        reject(error);
                    } else {
                        resolve(json);
                    }
                });
            })
            req.on('error', (err) => reject(err))
            req.write(data)
            req.end()
        });
    },

    call(config) {
        return (method, params) => {
            params = params || {};
            params = {...config, ...params,};
            return this.auth(params)
                .then((res) => {
                    let headers = {
                        'Authorization': 'Bearer ' + res['access_token'],
                    }
                    return this[method](params, headers);
                });
        }
    },

    auth(params) {
        let url = params.authEndpoint;
        let data = {
            client_id: params.clientId,
            client_secret: params.clientSecret,
            grant_type: 'client_credentials'
        }
        let query = '';
        for (let key of Object.keys(data)) {
            if (query !== "") {
                query += "&";
            }
            query += key + "=" + encodeURIComponent(data[key]);
        }
        url += '?' + query;
        return this.request('POST', url);
    },

    orders(params, headers) {
        return this.request('GET', params.apiUri + 'orders/' + params.orderId, null, headers);
    },

    ordersCreate(params, headers) {
        let url = params.apiUri + 'orders/';
        let body = {...params.order,};
        return this.request('POST', url, body, headers);
    },

    ordersDelete(params, headers) {
        return this.request('DELETE', params.apiUri + 'orders/' + params.orderId, null, headers);
    },

    ordersRefunds(params, headers) {
        let url = params.apiUri + 'orders/' + params.orderId + '/refunds';
        let body = {
            orderId: params.orderId,
            refund: {
                description: params.description || 'Refund',
                amount: params.amount || undefined,
            },
        };
        return this.request('POST', url, body, headers);
    },

    ordersTransactions(params, headers) {
        return this.request('POST', params.apiUri + 'orders/' + params.orderId + '/transactions', null, headers);
    },

    shops(params, headers) {
        return this.request('GET', params.apiUri + 'shops/' + params.shopId, null, headers);
    },

}
