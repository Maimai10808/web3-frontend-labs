export const TRADE_SIDES = ["buy", "sell"] as const;

export type TradeSide = (typeof TRADE_SIDES)[number];

export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "matched",
  "partially_filled",
  "filled",
  "cancelled",
  "rejected",
  "expired",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type TradeFormInput = {
  side: TradeSide;
  market: string;
  amount: string;
  price: string;
  slippageBps: string;
  deadlineSeconds: string;
};

export type TradeData = {
  side: TradeSide;
  market: string;
  amount: string;
  price: string;
  slippageBps: number;
  deadline: number;
};

export type ContractOrder = {
  trader: `0x${string}`;
  side: TradeSide;
  baseToken: `0x${string}`;
  quoteToken: `0x${string}`;
  price: string;
  amount: string;
  tif: string;
  nonce: string;
  deadline: number;
};

export type OperationType = "PLACE_LIMIT_ORDER";

export type Operation = {
  operationType: OperationType;
  account: `0x${string}`;
  clientOrderId: string;
  tradeData: TradeData;
  nonce: string;
  createdAt: number;
};

export type SigningPayload = {
  app?: string;
  version?: string;
  chainId?: number;
  operation?: Operation;
  domain?: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: `0x${string}`;
  };
  types?: {
    TradeOrder: ReadonlyArray<{
      name: string;
      type: string;
    }>;
  };
  primaryType?: "TradeOrder";
  message?: ContractOrder;
};

export type SignedOperation = {
  payload: SigningPayload;
  signature: string;
};

export type SubmitTradeRequest = {
  payload: SigningPayload;
  signature: string;
};

export type SubmitTradeResponse = {
  orderId: string;
  status: OrderStatus;
  order: Order;
  txHash?: `0x${string}`;
  receivedAt: number;
  receipt?: unknown;
};

export type Order = {
  orderId: string;
  clientOrderId: string;
  account: string;
  market: string;
  side: TradeSide;
  amount: string;
  price: string;
  filledAmount: string;
  status: OrderStatus;
  signature?: string;
  txHash?: string;
  baseToken?: string;
  quoteToken?: string;
  nonce?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

export type OrderEvent = {
  type: "order.created" | "order.updated";
  order: Order;
  createdAt: number;
};

export type TradeLog = {
  formInput?: TradeFormInput;
  tradeData?: TradeData;
  contractOrder?: ContractOrder;
  signingPayload?: SigningPayload;
  signature?: string;
  submitResponse?: SubmitTradeResponse;
  latestOrderEvent?: OrderEvent;
  errorMessage?: string;
};
