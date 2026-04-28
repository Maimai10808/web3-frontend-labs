import type {
  Operation,
  SigningPayload,
  TradeData,
  TradeFormInput,
} from "./types";

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

export function buildSigningPayload(operation: Operation): SigningPayload {
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
}) {
  const tradeData = encodeTradeData(params.input);

  const operation = buildOperation({
    account: params.account,
    tradeData,
  });

  const signingPayload = buildSigningPayload(operation);

  return {
    tradeData,
    operation,
    signingPayload,
  };
}
