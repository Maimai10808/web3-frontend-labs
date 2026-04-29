import {
  MockTokenAbi,
  TradeOrderBookAbi,
  contractAddresses,
  localDeployments,
} from "@web3-frontend-labs/contracts";
import { formatUnits, parseUnits, zeroAddress } from "viem";

import type {
  ContractOrder,
  Order,
  OrderEvent,
  OrderStatus,
  SubmitTradeResponse,
  TradeFormInput,
  TradeSide,
} from "@/lib/trade/types";

export const tradingStateChainId = localDeployments.chainId;
export const tradeOrderBookAddress = contractAddresses.TradeOrderBook;
export const mockTokenAddress = contractAddresses.MockToken;

export const tradeOrderBookContract = {
  address: tradeOrderBookAddress,
  abi: TradeOrderBookAbi,
  chainId: tradingStateChainId,
} as const;

export const mockTokenContract = {
  address: mockTokenAddress,
  abi: MockTokenAbi,
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

export const tradeMarketConfig = {
  label: "ETH-MOCK",
  baseToken: zeroAddress,
  quoteToken: mockTokenAddress,
  amountDecimals: 18,
  priceDecimals: 18,
} as const;

export type ChainTradeOrder = {
  trader: `0x${string}`;
  side: 0 | 1;
  baseToken: `0x${string}`;
  quoteToken: `0x${string}`;
  price: bigint;
  amount: bigint;
  tif: bigint;
  nonce: bigint;
  deadline: bigint;
};

type StoredOrderResult = {
  trader: `0x${string}`;
  side: number;
  baseToken: `0x${string}`;
  quoteToken: `0x${string}`;
  price: bigint;
  amount: bigint;
  tif: bigint;
  nonce: bigint;
  deadline: bigint;
  status: number;
  createdAt: bigint;
  updatedAt: bigint;
};

export type TradeSigningPayload = {
  domain: ReturnType<typeof getTradeOrderDomain>;
  types: typeof tradeOrderTypes;
  primaryType: "TradeOrder";
  message: ReturnType<typeof serializeChainTradeOrder>;
};

export function getTradeOrderDomain(chainId: number) {
  return {
    name: "TradeOrderBook",
    version: "1",
    chainId,
    verifyingContract: tradeOrderBookContract.address,
  } as const;
}

export function normalizeTradeOrderInput(input: TradeFormInput) {
  return {
    side: input.side,
    price: parseUnits(input.price, tradeMarketConfig.priceDecimals),
    amount: parseUnits(input.amount, tradeMarketConfig.amountDecimals),
    tif: BigInt(input.deadlineSeconds),
    deadline: BigInt(
      Math.floor(Date.now() / 1000) + Number(input.deadlineSeconds),
    ),
  };
}

export function toTradeOrderMessage(params: {
  trader: `0x${string}`;
  input: TradeFormInput;
  nonce: bigint;
}): ChainTradeOrder {
  const normalized = normalizeTradeOrderInput(params.input);

  return {
    trader: params.trader,
    side: normalized.side === "buy" ? 0 : 1,
    baseToken: tradeMarketConfig.baseToken,
    quoteToken: tradeMarketConfig.quoteToken,
    price: normalized.price,
    amount: normalized.amount,
    tif: normalized.tif,
    nonce: params.nonce,
    deadline: normalized.deadline,
  };
}

export function serializeChainTradeOrder(order: ChainTradeOrder): ContractOrder {
  return {
    trader: order.trader,
    side: order.side === 0 ? "buy" : "sell",
    baseToken: order.baseToken,
    quoteToken: order.quoteToken,
    price: order.price.toString(),
    amount: order.amount.toString(),
    tif: order.tif.toString(),
    nonce: order.nonce.toString(),
    deadline: Number(order.deadline),
  };
}

export function buildTradeSigningPayload(params: {
  chainId: number;
  order: ChainTradeOrder;
}): TradeSigningPayload {
  return {
    domain: getTradeOrderDomain(params.chainId),
    types: tradeOrderTypes,
    primaryType: "TradeOrder",
    message: serializeChainTradeOrder(params.order),
  };
}

export function mapChainStatus(status: number): OrderStatus {
  switch (status) {
    case 1:
      return "accepted";
    case 2:
      return "cancelled";
    case 3:
      return "filled";
    default:
      return "pending";
  }
}

export function mapStoredOrderToUiOrder(params: {
  orderId: `0x${string}`;
  storedOrder: StoredOrderResult;
  txHash?: `0x${string}`;
  signature?: string;
}): Order {
  const side: TradeSide = params.storedOrder.side === 0 ? "buy" : "sell";
  const status = mapChainStatus(params.storedOrder.status);

  return {
    orderId: params.orderId,
    clientOrderId: `${params.storedOrder.trader}:${params.storedOrder.nonce.toString()}`,
    account: params.storedOrder.trader,
    market: tradeMarketConfig.label,
    side,
    amount: formatUnits(
      params.storedOrder.amount,
      tradeMarketConfig.amountDecimals,
    ),
    price: formatUnits(
      params.storedOrder.price,
      tradeMarketConfig.priceDecimals,
    ),
    filledAmount:
      status === "filled"
        ? formatUnits(
            params.storedOrder.amount,
            tradeMarketConfig.amountDecimals,
          )
        : "0",
    status,
    signature: params.signature,
    txHash: params.txHash,
    baseToken: params.storedOrder.baseToken,
    quoteToken: params.storedOrder.quoteToken,
    nonce: params.storedOrder.nonce.toString(),
    createdAt: Number(params.storedOrder.createdAt) * 1000,
    updatedAt: Number(params.storedOrder.updatedAt) * 1000,
    expiresAt: Number(params.storedOrder.deadline) * 1000,
  };
}

export function createChainOrderEvent(params: {
  eventName: "OrderSubmitted" | "OrderCancelled" | "OrderFilled";
  order: Order;
}): OrderEvent {
  return {
    type: params.eventName === "OrderSubmitted" ? "order.created" : "order.updated",
    order: params.order,
    createdAt: Date.now(),
  };
}

export function buildChainSubmitResponse(params: {
  orderId: `0x${string}`;
  txHash: `0x${string}`;
  order: Order;
}): SubmitTradeResponse {
  return {
    orderId: params.orderId,
    status: params.order.status,
    order: params.order,
    txHash: params.txHash,
    receivedAt: Date.now(),
  };
}
