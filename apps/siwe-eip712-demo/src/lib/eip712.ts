import { z } from "zod";

const addressSchema = z.custom<`0x${string}`>(
  (value) => typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value),
  "Invalid Ethereum address",
);

const bytes32Schema = z.custom<`0x${string}`>(
  (value) => typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value),
  "Invalid bytes32 value",
);

export const orderInputSchema = z.object({
  maker: addressSchema,
  token: addressSchema,
  amount: z.string().regex(/^\d+$/, "Amount must be an integer string."),
  price: z.string().regex(/^\d+$/, "Price must be an integer string."),
  deadline: z.number().int().positive(),
  nonce: bytes32Schema,
});

export const orderFormSchema = z.object({
  token: addressSchema,
  amount: z.string().regex(/^\d+$/, "Amount must be an integer string."),
  price: z.string().regex(/^\d+$/, "Price must be an integer string."),
});

export type MockOrderInput = z.infer<typeof orderInputSchema>;
export type OrderFormInput = z.infer<typeof orderFormSchema>;

export type MockOrderTypedData = {
  maker: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  price: bigint;
  deadline: bigint;
  nonce: `0x${string}`;
};

export const orderTypes = {
  Order: [
    { name: "maker", type: "address" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "price", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

export function getOrderDomain(chainId: number) {
  return {
    name: "SIWE EIP712 Demo",
    version: "1",
    chainId,
    verifyingContract: "0x0000000000000000000000000000000000000000",
  } as const;
}

export function toOrderTypedData(order: MockOrderInput): MockOrderTypedData {
  return {
    maker: order.maker,
    token: order.token,
    amount: BigInt(order.amount),
    price: BigInt(order.price),
    deadline: BigInt(order.deadline),
    nonce: order.nonce,
  };
}
