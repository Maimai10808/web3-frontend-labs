export const TokenFactoryAbi = [
  {
    type: "function",
    name: "createToken",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "config",
        type: "tuple",
        components: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "maxSupply",
            type: "uint256",
          },
          {
            name: "metadataURI",
            type: "string",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "tokenAddress",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "getLaunchCount",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "getLaunchRecord",
    stateMutability: "view",
    inputs: [
      {
        name: "index",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          {
            name: "token",
            type: "address",
          },
          {
            name: "creator",
            type: "address",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "metadataURI",
            type: "string",
          },
          {
            name: "maxSupply",
            type: "uint256",
          },
          {
            name: "createdAt",
            type: "uint256",
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getCreatorTokens",
    stateMutability: "view",
    inputs: [
      {
        name: "creator",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address[]",
      },
    ],
  },
  {
    type: "function",
    name: "launchRecordByToken",
    stateMutability: "view",
    inputs: [
      {
        name: "",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "token",
        type: "address",
      },
      {
        name: "creator",
        type: "address",
      },
      {
        name: "name",
        type: "string",
      },
      {
        name: "symbol",
        type: "string",
      },
      {
        name: "metadataURI",
        type: "string",
      },
      {
        name: "maxSupply",
        type: "uint256",
      },
      {
        name: "createdAt",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "tokensByCreator",
    stateMutability: "view",
    inputs: [
      {
        name: "",
        type: "address",
      },
      {
        name: "",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "event",
    name: "TokenLaunched",
    anonymous: false,
    inputs: [
      {
        name: "creator",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        type: "address",
        indexed: true,
      },
      {
        name: "name",
        type: "string",
        indexed: false,
      },
      {
        name: "symbol",
        type: "string",
        indexed: false,
      },
      {
        name: "metadataURI",
        type: "string",
        indexed: false,
      },
      {
        name: "maxSupply",
        type: "uint256",
        indexed: false,
      },
    ],
  },
] as const;
