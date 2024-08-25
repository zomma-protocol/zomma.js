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
    usdcContractAddress: "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
    apiEndpoint: "https://api-v1.zomma.pro/",
    btcVerifierAddress: "0xAE8030005247a0608Ab905b5a625BE4120856ddF",
    ethVerifierAddress: "0x55704072E6995150644A997Ef9E1B3d88b06ac1A"
  },
  testnet: {
    providerUrl: "https://sepolia.era.zksync.dev",
    ethProviderNetwork: "sepolia",
    usdcContractAddress: "0x7dC1d7F6A9d03e0764b4935824410cCF709BF9DB",
    apiEndpoint: "https://zomma-api.joyso.io/",
    btcVerifierAddress: "0xa78eE98aBfEA370Cd6891457A754F1143b272495",
    ethVerifierAddress: "0xBB6d9E4e380d6dbF042d3B6C3b269Bd9B5337679"
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
  async getPoolInfo(market, vaultAddress) {
    const signedData = await this.signedData(market.name);
    return await this.callWithData(market.vaultContract, "getAccountInfo", [vaultAddress], signedData);
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