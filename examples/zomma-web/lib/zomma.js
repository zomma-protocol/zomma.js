import { Wallet } from "zksync-ethers";
import { getExpiries, getStrikes } from "./market.js";
import axios from "axios";
import { ethers } from "ethers";
import Base from "./base.js";
import { abs } from "./helper.js";
import { OptionPricer } from "./option_pricer.js";
import BigNumber from "bignumber.js";
export default class Zomma extends Base {
  /**
   * @param {Object} options - The options object.
   * @param {string} options.privateKey - The private key.
   */
  constructor(options) {
    super(options);
    this.optionPricer = new OptionPricer();
    if (options.signer) {
      // pass signer instance
      this.wallet = options.signer;
    } else if (options.provider && options.provider.provider.isMetaMask) {
      // browser environment, use MetaMask
      this.wallet = options.provider.getSigner();
    } else if (options.privateKey) {
      // Node.js environment, use private key
      this.wallet = new Wallet(options.privateKey, this.provider);
    } else {
      throw new Error("Neither signer nor provider nor privateKey provided");
    }
  }

  /**
   * Initializes the Zomma instance.
   */
  async initialize() {
    await this.init();
  }

  /**
   * Retrieves the available markets.
   * @returns {Promise<Array>} - The array of markets.
   */
  async getMarkets() {
    return this.markets;
  }

  /**
   * Retrieves the pool information for a specified market.
   * @param {Object} market - The market object.
   * @returns {Promise<Array>} - An array of pool information.
   */
  async getPoolConfig(market) {
    try {
      const response = await axios.get(`${this.apiEndpoint}api/main/v1/markets/${market.name}/config`);
      return response.data.config;
    } catch (error) {
      console.error(`Failed to retrieve pool information: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves the pool information for a specified market.
   * @param {Object} market - The market object.
   * @returns {Promise<Array>} - An array of pool information.
   */
  async getPools(market) {
    try {
      const response = await axios.get(`${this.apiEndpoint}api/main/v1/markets/${market.name}/pools`);
      return response.data.pools;
    } catch (error) {
      console.error(`Failed to retrieve pool information: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves the account balance.
   * @returns {Promise<BigInt>} - The account balance.
   */
  async getBalance() {
    return await this.wallet.getBalance();
  }

  /**
   * Retrieves the USDC balance.
   * @returns {Promise<BigInt>} - The USDC balance.
   */
  async getUSDCBalance() {
    return await this.provider.getBalance(this.wallet.address.toLowerCase(), "latest", this.usdcContract.target);
  }

  /**
   * Retrieves the expiries for a given market.
   * @param {Object} market - The market object.
   * @returns {Promise<Array>} - The array of expiries.
   */
  async getExpiries(market) {
    return await getExpiries(market.name);
  }

  /**
   * Retrieves the strikes for a given market and expiry.
   * @param {Object} market - The market object.
   * @param {number} expiry - The expiry timestamp.
   * @returns {Promise<Array>} - The array of strikes.
   */
  async getStrikes(market, expiry) {
    return await getStrikes(market.name, expiry.timestamp);
  }

  /**
   * Retrieves the prices for a given market.
   * @param {Object} market - The market object.
   * @returns {Promise<Array>} - The array of prices.
   */
  async getPrices(market) {
    const expiries = await this.getExpiries(market);
    const prices = [];

    // only call getPoolConfig once
    const config = await this.getPoolConfig(market);
    const spotPriceResp = await axios.get(`${this.apiEndpoint}api/main/v1/markets/${market.name}/oracles/spot_price`);
    const spotPrice = new BigNumber(spotPriceResp.data.spot_price).div(1e18);
    // get pools info
    const pools = await this.getPools(market);
    const poolInfo = await this.getPoolInfo(market, pools[0].address);
    for (const expiry of expiries) {
      const strikes = await this.getStrikes(market, expiry);
      for (const strike of strikes) {
        prices.push(await this.getLocalPrice(market, expiry, strike, true, true, config, spotPrice, poolInfo)); // buy call
        prices.push(await this.getLocalPrice(market, expiry, strike, true, false, config, spotPrice, poolInfo)); // sell call
        prices.push(await this.getLocalPrice(market, expiry, strike, false, true, config, spotPrice, poolInfo)); // buy put
        prices.push(await this.getLocalPrice(market, expiry, strike, false, false, config, spotPrice, poolInfo)); // sell put
      }
    }
    return prices;
  }
  async getLocalPrice(market, expiry, strike, isCall, isBuy, config, spotPrice, poolInfo) {
    const strikePrice = strike.price;
    const iv = new BigNumber(isCall ? isBuy ? strike.buy_call_iv : strike.sell_call_iv : isBuy ? strike.buy_put_iv : strike.sell_put_iv);
    const size = new BigNumber(isBuy ? "1" : "-1").times(1e18);
    const now = Math.floor(Date.now() / 1000);
    const available = new BigNumber(poolInfo[0].available.toString());
    const equity = new BigNumber(poolInfo[0].equity.toString());
    const [price, fee] = this.optionPricer.getPremium({
      now,
      spot: spotPrice,
      riskFreeRate: new BigNumber(config.risk_free_rate),
      initialMarginRiskRate: new BigNumber(config.initial_margin_risk_rate),
      iv,
      expiry: expiry.timestamp,
      strike: new BigNumber(strikePrice),
      size,
      minPremium: new BigNumber(config.min_premium),
      spotFee: new BigNumber(config.spot_fee),
      optionFee: new BigNumber(config.option_fee),
      priceRatio: new BigNumber(config.price_ratio),
      priceRatio2: new BigNumber(config.price_ratio2),
      priceRatioUtilization: new BigNumber(config.price_ratio_utilization),
      available,
      equity,
      isCall
    });
    return {
      expiry: expiry.timestamp,
      strike: strikePrice,
      isCall,
      isBuy,
      price: BigInt(price.multipliedBy(1e18).toFixed(0)),
      fee: BigInt(fee.multipliedBy(1e18).toFixed(0))
    };
  }

  /**
   * Retrieves the premium for a given option.
   * @param {Object} market - The market object.
   * @param {number} expiry - The expiry timestamp.
   * @param {string} strike - The strike price.
   * @param {boolean} isCall - Indicates if it's a call option.
   * @param {string} size - The size of the option.
   * @returns {Promise<Array>} - The premium and fee.
   */
  async getPremium(market, expiry, strike, isCall, size) {
    const signedData = await this.signedData(market.name);
    const config = await this.getPoolConfig(market);
    const pools = await this.getPools(market);
    const poolInfo = await this.getPoolInfo(market, pools[0].address);
    const reservedRate = BigInt(config.pool_reserved_rate);
    const reservedRateRatio = 1000000000000000000n - reservedRate; // 1 - pool_reserved_rate
    const usedMargin = poolInfo[0].marginBalance - poolInfo[0].available;
    const reservedMargin = poolInfo[0].marginBalance * reservedRateRatio / 1000000000000000000n;
    const utilization = usedMargin * 10000n / reservedMargin;
    if (utilization > 9900n) {
      return [0n, 0n];
    }
    return await this.callWithData(market.vaultContract, "getPremium", [expiry, strike, isCall, size], signedData);
  }

  /**
   * Executes a trade.
   * @param {Object} market - The market object.
   * @param {number} expiry - The expiry timestamp.
   * @param {string} strike - The strike price.
   * @param {boolean} isCall - Indicates if it's a call option.
   * @param {string} size - The size of the option.
   * @param {string} acceptTotal - The acceptable total price.
   * @param {string} gas - The gas fee.
   * @param {number} deadline - The trade deadline timestamp.
   * @param {Object} signed - The signed data.
   * @returns {Promise<Object>} - The trade response.
   */
  async trade(market, expiry, strike, isCall, size, acceptTotal, gas, deadline, signed) {
    const nonce = await this.getNonce(market, this.wallet.address.toLowerCase());
    const tradeData = {
      account: this.wallet.address.toLowerCase(),
      nonce: nonce,
      deadline: deadline,
      r: signed.r,
      s: signed.s,
      v: signed.v,
      gas_fee: gas,
      data: {
        data: [expiry, strike, isCall, size, acceptTotal]
      }
    };
    console.log(tradeData);
    const response = axios.post(`${this.apiEndpoint}api/main/v1/markets/${market.name}/trade_signatures`, tradeData);
    return response;
  }

  /**
   * Retrieves the orders for a given market.
   * @param {string} marketName - The market name.
   * @returns {Promise<Array>} - The array of orders.
   */
  async getOrders(marketName) {
    const response = await axios.get(`${this.apiEndpoint}/api/main/v1/markets/${marketName}/accounts/${this.wallet.address.toLowerCase()}/positions`);
    return response.data.positions;
  }

  /**
   * Buys an option.
   * @param {string} marketName - The market name.
   * @param {number} expiry - The expiry timestamp.
   * @param {string} strikeString - The strike price as a string.
   * @param {boolean} isCall - Indicates if it's a call option.
   * @param {string} sizeString - The size as a string.
   * @param {number} slippage - The slippage percentage.
   * @returns {Promise<Object>} - The trade response data.
   */
  async buy(marketName, expiry, strikeString, isCall, sizeString, slippage) {
    const market = this.markets.find(m => m.name === marketName);
    const strike = ethers.parseEther(strikeString);
    const size = ethers.parseEther(`${sizeString}`);
    const quote = await this.getPremium(market, expiry, strike.toString(), isCall, size.toString());
    const premium = quote[0];
    const fee = quote[1];
    console.log(`premium: ${premium}, fee: ${fee}`);
    const slippageBigInt = BigInt(Math.floor(slippage * 10));

    // let acceptTotal = abs((premium * 1005n) / 1000n + fee);
    let acceptTotal = abs(premium * (1000n + slippageBigInt) / 1000n + fee);
    console.log(`slippageBigInt: ${slippageBigInt}`);
    const deadline = Math.floor(Date.now() / 1000) + 120;
    console.log(`premium: ${premium}, fee: ${fee}, slippage: ${slippage}, acceptTotal: ${acceptTotal}`);
    const gasResponse = await this.getGasFee(market, this.wallet.address, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), deadline);
    const gas = BigInt(gasResponse.gas);
    const nonce = await this.getNonce(market, this.wallet.address);
    const signedData = await this.signData(market, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), nonce, gas, deadline);
    console.log(`gas: ${gas}, deadline: ${deadline}`);
    const tradeResponse = await this.trade(market, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), gas.toString(), deadline, signedData);
    return tradeResponse.data;
  }

  /**
   * Sells an option.
   * @param {string} marketName - The market name.
   * @param {number} expiry - The expiry timestamp.
   * @param {string} strikeString - The strike price as a string.
   * @param {boolean} isCall - Indicates if it's a call option.
   * @param {string} sizeString - The size as a string.
   * @param {number} slippage - The slippage percentage.
   * @returns {Promise<Object>} - The trade response data.
   */
  async sell(marketName, expiry, strikeString, isCall, sizeString, slippage) {
    const market = this.markets.find(m => m.name === marketName);
    const strike = ethers.parseEther(strikeString);
    const size = ethers.parseEther(`-${sizeString}`);
    const quote = await this.getPremium(market, expiry, strike.toString(), isCall, size.toString());
    const premium = quote[0];
    const fee = quote[1];
    console.log(`premium: ${premium}, fee: ${fee}`);
    const slippageBigInt = BigInt(Math.floor(slippage * 10));
    // let acceptTotal = abs((premium * 995n) / 1000n + fee);
    let acceptTotal = abs(premium * (1000n - slippageBigInt) / 1000n + fee);
    console.log(`slippageBigInt: ${slippageBigInt}`);
    const deadline = Math.floor(Date.now() / 1000) + 120;
    console.log(`premium: ${premium}, fee: ${fee}, slippage: ${slippage}, acceptTotal: ${acceptTotal}`);
    const gasResponse = await this.getGasFee(market, this.wallet.address, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), deadline);
    const gas = BigInt(gasResponse.gas);
    const nonce = await this.getNonce(market, this.wallet.address);
    const signedData = await this.signData(market, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), nonce, gas, deadline);
    console.log(`gas: ${gas}, deadline: ${deadline}`);
    const tradeResponse = await this.trade(market, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), gas.toString(), deadline, signedData);
    return tradeResponse.data;
  }
}

/**
 * Creates a new Zomma instance.
 * @param {Object} options - The options object.
 * @returns {Zomma} - The Zomma instance.
 */
export function createZomma(options) {
  return new Zomma(options);
}