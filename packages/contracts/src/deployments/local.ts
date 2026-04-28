export const localDeployments = {
  chainId: 31337,
  contracts: {
  "MockToken": {
    "address": "0x0165878a594ca255338adfa4d48449f69242eb8f",
    "transactionHash": "0x034acb7dda024d959052d4d097b01ec2927d3615e1be5706d53e884f58145fa3"
  },
  "DemoNFT": {
    "address": "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    "transactionHash": "0xceec93e4ebe51f842e2799f3b80e9bc7ea461544188453e2f282074e37fd54a7"
  },
  "TradeOrderBook": {
    "address": "0x8a791620dd6260079bf849dc5567adc3f2fdc318",
    "transactionHash": "0xe5609db0d3d89f74c28e0736ac51fc1e0230aaf2c3843f5506394114cabacd47"
  }
}
} as const;
