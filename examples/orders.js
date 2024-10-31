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

  let orders = await zomma.getOrders("BTC-USDC");
  console.log(orders);

  orders = await zomma.getOrders("ETH-USDC");
  console.log(orders);
}

init();