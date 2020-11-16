const api = require('./payu/api');
const crypto = require('crypto');

const PAYU_TEST_API = 'https://secure.snd.payu.com/api/v2_1/';
const PAYU_PROD_API = 'https://secure.payu.com/api/v2_1/';
const PAYU_TEST_AUTH_ENDPOINT = 'https://secure.snd.payu.com/pl/standard/user/oauth/authorize';
const PAYU_PROD_AUTH_ENDPOINT = 'https://secure.payu.com/pl/standard/user/oauth/authorize';

class Payu {

    constructor(clientId, clientSecret, posId, key, environment) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.posId = posId;
        this.key = key;
        this.environment = environment;

        if (this.environment === 'test') {
            this.apiUri = PAYU_TEST_API;
            this.authEndpoint = PAYU_TEST_AUTH_ENDPOINT;
        } else {
            this.apiUri = PAYU_PROD_API;
            this.authEndpoint = PAYU_PROD_AUTH_ENDPOINT;
        }

        this.api = api.call({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            posId: this.posId,
            key: this.key,
            apiUri: this.apiUri,
            authEndpoint: this.authEndpoint,
        });
    }

    getShopData(shopId) {
        if (!shopId) {
            throw new Error('Not given shop id');
        }
        return this.api('shops', {shopId});
    }

    getOrder(orderId) {
        if (!orderId) {
            throw new Error('Not given order id');
        }
        return this.api('orders', {orderId});
    }

    getOrderTransactions(orderId) {
        if (!orderId) {
            throw new Error('Not given order id');
        }
        return this.api('ordersTransactions', {orderId});
    }

    createOrder(order) {
        if (!order) {
            throw new Error('Not given order object');
        }
        return this.api('ordersCreate', {order});
    }

    cancelOrder(orderId) {
        if (!orderId) {
            throw new Error('Not given order id');
        }
        return this.api('ordersDelete', {orderId});
    }

    refundOrder(orderId, amount, description) {
        if (!orderId) {
            throw new Error('Not given order id');
        }
        return this.api('ordersRefunds', {orderId, amount, description});
    }

    verifyNotification(json, headers) {
        json = json || '';
        headers = headers || {};
        try {
            let header = headers['OpenPayu-Signature'] || '';
            let lines = header.split(';');
            let algorithm, signature;
            for (let line of lines) {
                line = line.trim();
                let cols = line.split('=');
                if (cols[0] === 'algorithm') {
                    algorithm = cols[1].toLowerCase();
                } else if (cols[0] === 'signature') {
                    signature = cols[1];
                }
            }
            if (algorithm && signature) {
                let concatenated = json + this.key;
                let expectedSignature = crypto.createHash(algorithm).update(concatenated).digest("hex");
                return expectedSignature === signature;
            }
        } catch (err) {
            // ignore
        }
        return false;
    }


}

module.exports = Payu;
