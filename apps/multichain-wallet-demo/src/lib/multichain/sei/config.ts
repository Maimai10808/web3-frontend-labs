export const seiChainConfiguration = {
  chainId: "pacific-1",
  restUrl: "https://rest.wallet.pacific-1.sei.io",
  rpcUrl: "https://rpc.wallet.pacific-1.sei.io",
};

export function getSeiPacificChainInfo() {
  return {
    chainId: "pacific-1",
    chainName: "Sei Network",
    rpc: seiChainConfiguration.rpcUrl,
    rest: seiChainConfiguration.restUrl,
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "sei",
      bech32PrefixAccPub: "seipub",
      bech32PrefixValAddr: "seivaloper",
      bech32PrefixValPub: "seivaloperpub",
      bech32PrefixConsAddr: "seivalcons",
      bech32PrefixConsPub: "seivalconspub",
    },
    currencies: [
      {
        coinDenom: "SEI",
        coinMinimalDenom: "usei",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SEI",
        coinMinimalDenom: "usei",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.02,
          average: 0.04,
          high: 0.06,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "SEI",
      coinMinimalDenom: "usei",
      coinDecimals: 6,
    },
    gasPriceStep: {
      low: 0.02,
      average: 0.04,
      high: 0.06,
    },
    features: ["cosmwasm"],
  };
}
