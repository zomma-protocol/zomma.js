import { Provider } from "zksync-ethers";
import { ethers } from "ethers";
import axios from "axios";
import VaultAbi from "./abi/vault.js";
import Erc20Abi from "./abi/erc20.js";
import * as dotenv from "dotenv";
dotenv.config();
const networkConfig = {
  mainnet: {
    providerUrl: "https://mainnet.era.zksync.io",
    ethProviderNetwork: 1,
    usdcContractAddress: process.env.ZKSYNC_MAINNET_USDC_ADDRESS,
    apiEndpoint: process.env.ZOMMA_MAINNET_API_ENDPOINT,
    btcVerifierAddress: process.env.ZOMMA_MAINNET_BTC_VERIFIER_ADDRESS,
    ethVerifierAddress: process.env.ZOMMA_MAINNET_ETH_VERIFIER_ADDRESS
  },
  testnet: {
    providerUrl: "https://sepolia.era.zksync.dev",
    ethProviderNetwork: "sepolia",
    usdcContractAddress: process.env.ZKSYNC_SEPOLIA_USDC_ADDRESS,
    apiEndpoint: process.env.ZOMMA_TESTNET_API_ENDPOINT,
    btcVerifierAddress: process.env.ZOMMA_TESTNET_BTC_VERIFIER_ADDRESS,
    ethVerifierAddress: process.env.ZOMMA_TESTNET_ETH_VERIFIER_ADDRESS
  }
};
export default class Base {
  constructor(options) {
    options.network = options.network || "mainnet";
    const {
      providerUrl,
      ethProviderNetwork,
      usdcContractAddress,
      apiEndpoint,
      btcVerifierAddress,
      ethVerifierAddress
    } = networkConfig[options.network];
    this.provider = new Provider(providerUrl);
    this.ethProvider = Provider.getDefaultProvider(ethProviderNetwork);
    this.usdcContract = new ethers.Contract(usdcContractAddress, Erc20Abi, this.provider);
    this.apiEndpoint = apiEndpoint;
    this.verifyingContracts = {
      "BTC-USDC": btcVerifierAddress,
      "ETH-USDC": ethVerifierAddress
    };
  }
  async init() {
    this.markets = await this.fetchMarkets();
    for (const market of this.markets) {
      market.vaultContract = new ethers.Contract(market.vault, VaultAbi, this.provider);
      market.vaultOwner = await market.vaultContract.owner();
    }
  }
  async fetchMarkets() {
    const response = await axios.get(`${this.apiEndpoint}api/main/v1/markets`);
    return response.data.markets;
  }
  async signedData(market) {
    const response = await axios.get(`${this.apiEndpoint}api/main/v1/markets/${market}/oracles/signed_data`);
    return response.data.data;
  }
  async getGasFee(market, account, expiry, strike, isCall, size, acceptTotal, deadline) {
    const gasFeeData = {
      data: {
        data: [expiry, strike, isCall, size, acceptTotal]
      },
      deadline,
      account
    };
    const response = await axios.post(`${this.apiEndpoint}api/main/v1/markets/${market.name}/trade_signatures/gas`, gasFeeData);
    return response.data;
  }
  async getNonce(market, account) {
    const response = await axios.get(`${this.apiEndpoint}api/main/v1/markets/${market.name}/trade_signatures/nonce?account=${account.toLowerCase()}`);
    return response.data.nonce;
  }
  async callWithData(contract, methodName, params = [], extraData = "") {
    const fragment = contract.interface.getFunction(methodName);
    const data = contract.interface.encodeFunctionData(fragment, params) + extraData;
    const returnData = await contract.runner.call({
      to: contract.target,
      data
    });
    return contract.interface.decodeFunctionResult(fragment, returnData);
  }
  async getAccountInfo(market) {
    const signedData = await this.signedData(market.name);
    return await this.callWithData(market.vaultContract, "getAccountInfo", [this.wallet.address.toLowerCase()], signedData);
  }
  async signData(market, expiry, strike, isCall, size, acceptableTotal, nonce, gasFee, deadline) {
    const chainId = (await this.provider.getNetwork()).chainId;
    const domain = {
      name: "SignatureValidator",
      version: "1",
      chainId,
      verifyingContract: this.verifyingContracts[market.name]
    };
    const types = {
      Trade: [{
        name: "data",
        type: "int256[]"
      }, {
        name: "deadline",
        type: "uint256"
      }, {
        name: "gasFee",
        type: "uint256"
      }, {
        name: "nonce",
        type: "uint256"
      }]
    };
    const data = [expiry, strike, isCall, size, acceptableTotal];
    const value = {
      data,
      deadline,
      gasFee,
      nonce
    };
    const sig = await this.wallet.signTypedData(domain, types, value);
    return ethers.Signature.from(sig);
  }
}