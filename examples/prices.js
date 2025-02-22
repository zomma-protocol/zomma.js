import Zomma from "../src/zomma.js";
import { ethers } from "ethers";

import * as dotenv from "dotenv";
dotenv.config();

const init = async () => {
  // Initialize Zomma instance
  const zomma = new Zomma({
    privateKey: process.env.PRIVATE_KEY,
    network: "mainnet",
  });
  await zomma.initialize();

  const markets = await zomma.getMarkets();

  const prices = await zomma.getPrices(markets[1]);
  console.log(prices);
};

init();
