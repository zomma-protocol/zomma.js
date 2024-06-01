# Zomma Option API

The Zomma Option API is a client library for trading options on the Zomma platform. It provides an easy-to-use interface for interacting with the Zomma API, allowing you to fetch market data, retrieve account information, and place buy and sell orders.

## Installation

To install the Zomma Option API library, use the following command:

```bash
npm install zomma.js
```

## Usage

### Importing the Library

To use the Zomma Option API library in your project, you need to import it first:

```javascript
import Zomma from 'zomma.js';
```

### Initializing the Zomma Instance

Before you can start using the library, you need to initialize a Zomma instance with your private key and the desired network (mainnet or testnet):

```javascript
const zomma = new Zomma({
  privateKey: 'YOUR_PRIVATE_KEY',
  network: 'mainnet', // or 'testnet' for the test network
});

await zomma.initialize();
```

### Fetching Market Data

You can fetch the available markets using the `getMarkets` method:

```javascript
const markets = await zomma.getMarkets();
console.log(markets);
```

### Retrieving Account Information

To retrieve account information, such as balances and positions, use the `getAccountInfo` method:

```javascript
const accountInfo = await zomma.getAccountInfo(markets[0], zomma.wallet.address);
console.log(ethers.formatEther(accountInfo[0].initialMargin));
{
  initialMargin: 1446.1108696148
  marginBalance: 26668.210827902161793263
  equity: 26481.483722905361793263
  equityWithFee: 26470.750172013833793263
  upnl: -73.420174597650921454
  available: 25222.099958287361793263,
  healthFactor: 21.027334532089830127,
}
// ...
```

### Placing Buy and Sell Orders

You can buy and sell orders using the `buy` and `sell` methods, respectively:

```javascript
// Buy 0.1 ETH-USDC 4100 call option expiring on 2023-06-07 with 0.5% slippage
const tradeResponse = await zomma.buy("ETH-USDC", 1717747200, "4100", 1, "0.1", 0.5);
console.log(tradeResponse);

// Sell 0.31 ETH-USDC 3500 put option expiring on 2023-06-14 with 0.5% slippage
const tradeResponse2 = await zomma.sell("ETH-USDC", 1718352000, "3500", 0, "0.31", 0.5);
console.log(tradeResponse2);
```

### Retrieving Orders

You can retrieve the list of orders for a specific market using the `getOrders` method:

```javascript
let orders = await zomma.getOrders("BTC-USDC");
console.log(orders);
```

## Examples

The library includes example scripts demonstrating various usage scenarios. You can find them in the `examples` directory:

- `account.js`: Demonstrates how to fetch market data and retrieve account information.
- `trade.js`: Demonstrates how to place buy and sell orders.
- `orders.js`: Demonstrates how to retrieve the list of orders for a specific market.

## Documentation

For detailed information about the available methods and their parameters, please refer to the source code

## License

This library is released under the [MIT License](LICENSE).