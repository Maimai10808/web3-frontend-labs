import type {
  ContractOrder,
  Operation,
  SigningPayload,
  TradeData,
  TradeFormInput,
} from "./types";
import {
  getTradeOrderDomain,
  serializeChainTradeOrder,
  tradeOrderTypes,
} from "@/lib/contracts/trade-order-book";

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function generateClientOrderId() {
  return `client_${Date.now()}_${crypto.randomUUID()}`;
}

function generateNonce() {
  return crypto.randomUUID();
}

export function encodeTradeData(input: TradeFormInput): TradeData {
  const deadline = nowSeconds() + Number(input.deadlineSeconds);

  return {
    market: input.market,
    side: input.side,
    amount: input.amount,
    price: input.price,
    slippageBps: Number(input.slippageBps),
    deadline,
  };
}

export function buildOperation(params: {
  account: `0x${string}`;
  tradeData: TradeData;
}): Operation {
  return {
    operationType: "PLACE_LIMIT_ORDER",
    account: params.account,
    clientOrderId: generateClientOrderId(),
    tradeData: params.tradeData,
    nonce: generateNonce(),
    createdAt: Date.now(),
  };
}

export function buildMockSigningPayload(operation: Operation): SigningPayload {
  return {
    app: "SimplifiedTradingDemo",
    version: "1",
    chainId: 31337,
    operation,
  };
}

export function createTradeSigningFlow(params: {
  account: `0x${string}`;
  input: TradeFormInput;
  chainId: number;
  chainOrder?: {
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
}) {
  const tradeData = encodeTradeData(params.input);
  const contractOrder: ContractOrder | undefined = params.chainOrder
    ? serializeChainTradeOrder(params.chainOrder)
    : undefined;
  const signingPayload: SigningPayload = {
    domain: getTradeOrderDomain(params.chainId),
    types: tradeOrderTypes,
    primaryType: "TradeOrder",
    message: contractOrder,
  };

  return {
    tradeData,
    contractOrder,
    signingPayload,
  };
}

export function createMockTradeSigningFlow(params: {
  account: `0x${string}`;
  input: TradeFormInput;
}) {
  const tradeData = encodeTradeData(params.input);
  const operation = buildOperation({
    account: params.account,
    tradeData,
  });
  const signingPayload = buildMockSigningPayload(operation);

  return {
    tradeData,
    operation,
    signingPayload,
  };
}
