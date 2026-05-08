import {
  tradeOrderBookAbi,
  tradeOrderBookAddress,
  tradingDemoDeploymentMeta,
} from "@web3-frontend-labs/contracts/trading-demo";

export const tradingStateChainId = tradingDemoDeploymentMeta.chainId;

export const tradeOrderBookContract = {
  address: tradeOrderBookAddress,
  abi: tradeOrderBookAbi,
  chainId: tradingStateChainId,
} as const;

export const tradeOrderTypes = {
  TradeOrder: [
    { name: "trader", type: "address" },
    { name: "side", type: "uint8" },
    { name: "baseToken", type: "address" },
    { name: "quoteToken", type: "address" },
    { name: "price", type: "uint256" },
    { name: "amount", type: "uint256" },
    { name: "tif", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export function getTradeOrderDomain(chainId: number) {
  return {
    name: "TradeOrderBook",
    version: "1",
    chainId,
    verifyingContract: tradeOrderBookContract.address,
  } as const;
}
