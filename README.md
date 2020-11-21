# NodeJs Payu SDK

A lightweight library that allows easy communication with the Polish Payu API v2_1.

## Getting Started
Install it via npm:
```bash
npm install nodejs-payu-sdk --save
```
Use the built-in methods:
```javascript
var Payu = require('nodejs-payu-sdk');
var payu = new Payu(clientId, clientSecret, posId, key, environment);
payu.createOrder({ ... })
    .then((res) => { })
    .catch((err) => { });
```
## Available methods
- getShopData()
- getOrder(orderId)
- getOrderTransactions(orderId)
- createOrder(order)
- cancelOrder(orderId)
- refundOrder(orderId, amount, description)
    - amount(optional): empty means full refund
    - description(optional)
- verifyNotification(json, headers)

## License

[MIT](./LICENSE)
