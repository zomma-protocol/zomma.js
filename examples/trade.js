import Zomma from "../src/zomma.js";
import { ethers } from "ethers";

import * as dotenv from "dotenv";
dotenv.config();


const init = async () => {
  // Initialize Zomma instance
  const zomma = new Zomma({
    privateKey: process.env.PRIVATE_KEY,
    network: "testnet",
  });
  await zomma.initialize();

  // Buy 6/7 ETH-USDC 4100 call 0.1 size
  // const tradeResponse = await zomma.buy("ETH-USDC", 1717747200, "4100", 1, "0.1", 0.5);
  // console.log(tradeResponse);

  // Buy 6/14 ETH-USDC 3200 put 0.5 size
  // const tradeResponse2 = await zomma.buy("ETH-USDC", 1718352000, "3200", 0, "0.5", 0.5);
  // console.log(tradeResponse2);

  // Sell 6/14 ETH-USDC 3900 call 0.7 size with slippage 0.5%
  // const tradeResponse3 = await zomma.sell("ETH-USDC", 1718352000, "4100", 1, "0.7", 0.5);
  // console.log(tradeResponse3);

  // Sell 6/14 ETH-USDC 3500 put 0.31 size with slippage 0.5%
  // const tradeResponse4 = await zomma.sell("ETH-USDC", 1718352000, "3500", 0, "0.31", 0.5);
  // console.log(tradeResponse4);

  // Buy 6/14 BTC-USDC 72000 call 0.02 size with slippage 0.5%
  // const tradeResponse5 = await zomma.buy("BTC-USDC", 1718352000, "72000", 1, "0.01", 0.5);
  // console.log(tradeResponse5);

  // Buy 6/28 BTC-USDC 62000 put 0.02 size with slippage 0.5%
  // const tradeResponse6 = await zomma.buy("BTC-USDC", 1719561600, "62000", 0, "0.01", 0.2);
  // console.log(tradeResponse5);

  // Sell 6/28 BTC-USDC 74000 call 0.05 size with slippage 0.5%
  // const tradeResponse7 = await zomma.sell("BTC-USDC", 1719561600, "74000", 1, "0.05", 0.5);
  // console.log(tradeResponse7);

  // Sell 6/28 BTC-USDC 65000 put 0.03 size with slippage 0.5%
  const tradeResponse8 = await zomma.sell("BTC-USDC", 1719561600, "65000", 0, "0.015", 0.5);
  console.log(tradeResponse8);
}


init();