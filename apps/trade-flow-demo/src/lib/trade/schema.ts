import { z } from "zod";
import { ORDER_STATUSES, TRADE_SIDES } from "./types";

function isPositiveNumberString(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0;
}

function isNonNegativeIntegerString(value: string) {
  const numberValue = Number(value);
  return (
    Number.isInteger(numberValue) &&
    Number.isFinite(numberValue) &&
    numberValue >= 0
  );
}

export const tradeFormSchema = z.object({
  side: z.enum(TRADE_SIDES),

  market: z.string().min(1, "Market is required").max(32, "Market is too long"),

  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(isPositiveNumberString, "Amount must be greater than 0"),

  price: z
    .string()
    .min(1, "Price is required")
    .refine(isPositiveNumberString, "Price must be greater than 0"),

  slippageBps: z
    .string()
    .min(1, "Slippage is required")
    .refine(
      isNonNegativeIntegerString,
      "Slippage must be a non-negative integer",
    )
    .refine(
      (value) => Number(value) <= 1000,
      "Slippage cannot exceed 1000 bps",
    ),

  deadlineSeconds: z
    .string()
    .min(1, "Deadline is required")
    .refine(
      isNonNegativeIntegerString,
      "Deadline must be a non-negative integer",
    )
    .refine(
      (value) => Number(value) >= 10,
      "Deadline must be at least 10 seconds",
    )
    .refine(
      (value) => Number(value) <= 86_400,
      "Deadline cannot exceed 24 hours",
    ),
});

export const tradeDataSchema = z.object({
  side: z.enum(TRADE_SIDES),
  market: z.string().min(1),
  amount: z.string().min(1),
  price: z.string().min(1),
  slippageBps: z.number().int().min(0).max(1000),
  deadline: z.number().int().positive(),
});

export const operationSchema = z.object({
  operationType: z.literal("PLACE_LIMIT_ORDER"),
  account: z.custom<`0x${string}`>(
    (value) => typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value),
    "Invalid account address",
  ),
  clientOrderId: z.string().min(1),
  tradeData: tradeDataSchema,
  nonce: z.string().min(1),
  createdAt: z.number().int().positive(),
});

export const signingPayloadSchema = z.object({
  app: z.string().min(1),
  version: z.string().min(1),
  chainId: z.number().int().positive(),
  operation: operationSchema,
});

export const submitTradeRequestSchema = z.object({
  payload: signingPayloadSchema,
  signature: z.string().min(1, "Signature is required"),
});

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const orderSchema = z.object({
  orderId: z.string().min(1),
  clientOrderId: z.string().min(1),
  account: z.string().min(1),
  market: z.string().min(1),
  side: z.enum(TRADE_SIDES),
  amount: z.string().min(1),
  price: z.string().min(1),
  filledAmount: z.string().min(1),
  status: orderStatusSchema,
  signature: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
});

export type TradeFormSchemaInput = z.infer<typeof tradeFormSchema>;
export type TradeDataSchemaInput = z.infer<typeof tradeDataSchema>;
export type OperationSchemaInput = z.infer<typeof operationSchema>;
export type SigningPayloadSchemaInput = z.infer<typeof signingPayloadSchema>;
export type SubmitTradeRequestSchemaInput = z.infer<
  typeof submitTradeRequestSchema
>;
export type OrderSchemaInput = z.infer<typeof orderSchema>;
