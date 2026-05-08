import { z } from "zod";
import { expectedOrderTokenAddress } from "./domain";

const addressSchema = z.custom<`0x${string}`>(
  (value) => typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value),
  "Invalid Ethereum address",
);

const bytes32Schema = z.custom<`0x${string}`>(
  (value) => typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value),
  "Invalid bytes32 value",
);

const uintStringSchema = z
  .string()
  .regex(/^\d+$/, "Value must be an unsigned integer string.");

export const signedOrderFormSchema = z.object({
  recipient: addressSchema,
  amount: uintStringSchema,
});

export const signedOrderInputSchema = z.object({
  maker: addressSchema,
  token: addressSchema,
  recipient: addressSchema,
  amount: uintStringSchema,
  deadline: uintStringSchema,
  nonce: bytes32Schema,
});

export type SignedOrderFormInput = z.infer<typeof signedOrderFormSchema>;
export type SignedOrderInput = z.infer<typeof signedOrderInputSchema>;

export type SignedOrderTypedData = {
  maker: `0x${string}`;
  token: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
  deadline: bigint;
  nonce: `0x${string}`;
};

export const signedOrderTypes = {
  Order: [
    { name: "maker", type: "address" },
    { name: "token", type: "address" },
    { name: "recipient", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

export function buildSignedOrderInput(params: {
  maker: `0x${string}`;
  recipient: `0x${string}`;
  amount: string;
  nonce: `0x${string}`;
  deadline: number | bigint;
  token?: `0x${string}`;
}): SignedOrderInput {
  return {
    maker: params.maker,
    token: params.token ?? expectedOrderTokenAddress,
    recipient: params.recipient,
    amount: params.amount,
    deadline: params.deadline.toString(),
    nonce: params.nonce,
  };
}

export function toSignedOrderTypedData(
  order: SignedOrderInput,
): SignedOrderTypedData {
  return {
    maker: order.maker,
    token: order.token,
    recipient: order.recipient,
    amount: BigInt(order.amount),
    deadline: BigInt(order.deadline),
    nonce: order.nonce,
  };
}

export function serializeSignedOrderTypedData(order: SignedOrderTypedData) {
  return {
    ...order,
    amount: order.amount.toString(),
    deadline: order.deadline.toString(),
  };
}
