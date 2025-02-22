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

There are two ways to initialize the Zomma instance:

#### 1. Using Private Key (Node.js Environment)

```javascript
const zomma = new Zomma({
  privateKey: 'YOUR_PRIVATE_KEY',
  network: 'mainnet', // or 'testnet' for the test network
});

await zomma.initialize();
```

#### 2. Using Web3 Provider (Browser Environment)

```javascript
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const zomma = new Zomma({
  signer: signer,
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

### Fetching Market Prices

You can fetch the prices for a specific market using the `getPrices` method:

```javascript
const markets = await zomma.getMarkets();
const prices = await zomma.getPrices(markets[0]);
console.log(prices);
```

## Examples

The library includes example scripts demonstrating various usage scenarios. You can find them in the `examples` directory:

- `account.js`: Demonstrates how to fetch market data and retrieve account information.
- `trade.js`: Demonstrates how to place buy and sell orders.
- `orders.js`: Demonstrates how to retrieve the list of orders for a specific market.
- `zomma-web`: A browser-based demo showing how to use the library with MetaMask.

### Running the Web Demo

To run the browser-based demo:

```bash
cd examples/zomma-web
yarn
yarn dev
```

This will start a local development server. Open your browser and navigate to the displayed URL (usually http://localhost:5173). Make sure you have MetaMask installed in your browser.

The web demo includes examples of:
- Connecting to MetaMask
- Fetching market data
- Retrieving account information
- Placing buy/sell orders for both calls and puts

## Documentation

For detailed information about the available methods and their parameters, please refer to the source code

## License

This library is released under the [MIT License](LICENSE).