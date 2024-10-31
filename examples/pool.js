import Zomma from '../src/zomma.js';
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

  console.log(markets[0]);

  const config = await zomma.getPoolConfig(markets[0]);

  const pools = await zomma.getPools(markets[0]);
  console.log(pools[0]);
  const accountInfo = await zomma.getPoolInfo(markets[0], pools[0].address);

  console.log(accountInfo);

  console.log(`initialMargin: ${ethers.formatEther(accountInfo[0].initialMargin)}`);
  console.log(`marginBalance: ${ethers.formatEther(accountInfo[0].marginBalance)}`);
  console.log(`marginBalance * 0.7: ${ethers.formatEther(accountInfo[0].marginBalance * 30n / 100n)}`);
  console.log(`equity: ${ethers.formatEther(accountInfo[0].equity)}`);
  console.log(`equityWithFee: ${ethers.formatEther(accountInfo[0].equityWithFee)}`);
  console.log(`upnl: ${ethers.formatEther(accountInfo[0].upnl)}`);
  console.log(`available: ${ethers.formatEther(accountInfo[0].available)}`);
  console.log(`healthFactor: ${ethers.formatEther(accountInfo[0].healthFactor)}`);


  // const reservedRate = BigInt(pools[0].reserved_rate);
  // const reservedRateRatio = (1000000000000000000n - reservedRate);
  // console.log(`reservedRateRatio: ${reservedRateRatio}`);

  // const utilization =
  //   (10000n * accountInfo[0].available) /
  //   (accountInfo[0].equity - accountInfo[0].marginBalance * reservedRateRatio / 1000000000000000000n);

  // console.log(`Utilization: ${utilization}`);


const reservedRate = BigInt(config.pool_reserved_rate);
const reservedRateRatio = 1000000000000000000n - reservedRate; // 1 - reserved_rate

const usedMargin = accountInfo[0].marginBalance - accountInfo[0].available;
const reservedMargin =
  (accountInfo[0].marginBalance * reservedRateRatio) / 1000000000000000000n;
const utilization = (usedMargin * 10000n) / reservedMargin;

console.log(`Utilization: ${utilization / 100n}.${utilization % 100n}%`);


}

init();