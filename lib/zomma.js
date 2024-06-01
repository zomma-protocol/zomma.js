import { Wallet } from "zksync-ethers";
import { getExpiries, getStrikes } from "./market.js";
import axios from "axios";
import { ethers } from "ethers";
import Base from "./base.js";
import { abs } from "./helper.js";
export default class Zomma extends Base {
  /**
   * @param {Object} options - The options object.
   * @param {string} options.privateKey - The private key.
   */
  constructor(options) {
    super(options);
    this.wallet = new Wallet(options.privateKey, this.provider, this.ethProvider);
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
    return await getExpiries(market);
  }

  /**
   * Retrieves the strikes for a given market and expiry.
   * @param {Object} market - The market object.
   * @param {number} expiry - The expiry timestamp.
   * @returns {Promise<Array>} - The array of strikes.
   */
  async getStrikes(market, expiry) {
    return await getStrikes(market, expiry);
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
    const slippageBigInt = BigInt(Math.floor(slippage * 1000));

    // let acceptTotal = abs((premium * 1005n) / 1000n + fee);
    let acceptTotal = abs(premium * (1000n + slippageBigInt) / 1000n + fee);
    const deadline = Math.floor(Date.now() / 1000) + 120;
    const gasResponse = await this.getGasFee(market, this.wallet.address, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), deadline);
    const gas = BigInt(gasResponse.gas);
    const nonce = await this.getNonce(market, this.wallet.address);
    const signedData = await this.signData(market, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), nonce, gas, deadline);
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
    const slippageBigInt = BigInt(Math.floor(slippage * 1000));
    // let acceptTotal = abs((premium * 995n) / 1000n + fee);
    let acceptTotal = abs(premium * (1000n - slippageBigInt) / 1000n + fee);
    const deadline = Math.floor(Date.now() / 1000) + 120;
    const gasResponse = await this.getGasFee(market, this.wallet.address, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), deadline);
    const gas = BigInt(gasResponse.gas);
    const nonce = await this.getNonce(market, this.wallet.address);
    const signedData = await this.signData(market, expiry, strike.toString(), isCall, size.toString(), acceptTotal.toString(), nonce, gas, deadline);
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