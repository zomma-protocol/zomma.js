export default [
  {
    inputs: [],
    name: "AlreadyInitialized",
    type: "error",
  },
  {
    inputs: [],
    name: "CannotClear",
    type: "error",
  },
  {
    inputs: [],
    name: "CannotLiquidate",
    type: "error",
  },
  {
    inputs: [],
    name: "Expired",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientEquity",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidFreeWithdrawableRate",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInput",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMarket",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRate",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSize",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidTime",
    type: "error",
  },
  {
    inputs: [],
    name: "IvOutdated",
    type: "error",
  },
  {
    inputs: [],
    name: "NotOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "OutOfRange",
    type: "error",
  },
  {
    inputs: [],
    name: "PoolUnavailable",
    type: "error",
  },
  {
    inputs: [],
    name: "SellPositionFirst",
    type: "error",
  },
  {
    inputs: [],
    name: "SignatureExpired",
    type: "error",
  },
  {
    inputs: [],
    name: "TradeDisabled",
    type: "error",
  },
  {
    inputs: [],
    name: "UnacceptableAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "UnacceptablePrice",
    type: "error",
  },
  {
    inputs: [],
    name: "Unavailable",
    type: "error",
  },
  {
    inputs: [],
    name: "Unsettled",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawTooMuch",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAmount2",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroPosition",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroPrice",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "amount",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "enum Vault.FundType",
        name: "fundType",
        type: "uint8",
      },
    ],
    name: "Fund",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "strike",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isCall",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "size",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "notional",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "fee",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "enum Ledger.ChangeType",
        name: "changeType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "realized",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "gasFee",
        type: "int256",
      },
    ],
    name: "PositionUpdate",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "changeOwner",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "clear",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "config",
    outputs: [
      {
        internalType: "contract Config",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getAccountInfo",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "initialMargin",
            type: "uint256",
          },
          {
            internalType: "int256",
            name: "marginBalance",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "equity",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "equityWithFee",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "upnl",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "available",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "healthFactor",
            type: "int256",
          },
        ],
        internalType: "struct IVault.AccountInfo",
        name: "accountInfo",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "strike",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isCall",
        type: "bool",
      },
      {
        internalType: "int256",
        name: "size",
        type: "int256",
      },
    ],
    name: "getPremium",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_config",
        type: "address",
      },
      {
        internalType: "address",
        name: "_spotPricer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_optionPricer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_optionMarket",
        type: "address",
      },
      {
        internalType: "address",
        name: "_signatureValidator",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialized",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "strike",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isCall",
        type: "bool",
      },
      {
        internalType: "int256",
        name: "size",
        type: "int256",
      },
    ],
    name: "liquidate",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "listOfExpiries",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
    ],
    name: "listOfStrikes",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "optionMarket",
    outputs: [
      {
        internalType: "contract OptionMarket",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "optionPricer",
    outputs: [
      {
        internalType: "contract IOptionPricer",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "strike",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isCall",
        type: "bool",
      },
    ],
    name: "positionOf",
    outputs: [
      {
        components: [
          {
            internalType: "int256",
            name: "size",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "notional",
            type: "int256",
          },
        ],
        internalType: "struct Ledger.Position",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "strike",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isCall",
        type: "bool",
      },
    ],
    name: "positionSizeOf",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_config",
        type: "address",
      },
      {
        internalType: "address",
        name: "_spotPricer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_optionPricer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_optionMarket",
        type: "address",
      },
      {
        internalType: "address",
        name: "_signatureValidator",
        type: "address",
      },
    ],
    name: "setAddresses",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
    ],
    name: "settle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "signatureValidator",
    outputs: [
      {
        internalType: "contract SignatureValidator",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "spotPricer",
    outputs: [
      {
        internalType: "contract SpotPricer",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256[]",
        name: "data",
        type: "int256[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "trade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256[]",
        name: "data",
        type: "int256[]",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "gasFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "tradeBySignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "rate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "acceptableAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "freeWithdrawableRate",
        type: "uint256",
      },
    ],
    name: "withdrawPercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
