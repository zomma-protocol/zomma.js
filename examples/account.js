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

  // Get available markets
  const markets = await zomma.getMarkets();
  console.log(markets);

  // Get account info in Zomma
  // initialMargin
  // marginBalance
  // equity
  // equityWithFee
  // upnl
  // available
  // healthFactor
  const accountInfo = await zomma.getAccountInfo(
    markets[1],
    zomma.wallet.address
  );

  console.log(accountInfo);
  // console.log(ethers.formatEther(accountInfo[0].initialMargin));
  // console.log(ethers.formatEther(accountInfo[0].marginBalance));
  // console.log(ethers.formatEther(accountInfo[0].equity));
  // console.log(ethers.formatEther(accountInfo[0].equityWithFee));
  // console.log(ethers.formatEther(accountInfo[0].upnl));
  // console.log(ethers.formatEther(accountInfo[0].available));
  // console.log(ethers.formatEther(accountInfo[0].healthFactor));

  const size = ethers.parseEther(`0.1`);
  const strike = ethers.parseEther(`65000`);
  // const strike = ethers.parseEther(`3000`);

  // Get quotes
  const quote = await zomma.getPremium(
    markets[0],
    1729843200,
    strike,
    true,
    size.toString()
  );
  console.log(quote);
  const premium = quote[0];
  const fee = quote[1];

  console.log(ethers.formatEther(premium));
  console.log(ethers.formatEther(fee));
}

init()