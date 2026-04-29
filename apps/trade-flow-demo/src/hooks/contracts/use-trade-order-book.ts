"use client";

import {
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import type { ChainTradeOrder } from "@/lib/contracts/trade-order-book";
import { tradeOrderBookContract } from "@/lib/contracts/trade-order-book";

export function useTradeOrderBook(account?: `0x${string}`) {
  const publicClient = usePublicClient({ chainId: tradeOrderBookContract.chainId });
  const writeContract = useWriteContract();
  const receiptQuery = useWaitForTransactionReceipt({
    hash: writeContract.data,
    query: {
      enabled: Boolean(writeContract.data),
    },
  });

  const nonceQuery = useReadContract({
    ...tradeOrderBookContract,
    functionName: "nonces",
    args: account ? [account] : undefined,
    query: {
      enabled: Boolean(account),
    },
  });

  return {
    publicClient,
    writeContractAsync: writeContract.writeContractAsync,
    latestHash: writeContract.data,
    isWriting: writeContract.isPending,
    receipt: receiptQuery.data,
    isConfirming: receiptQuery.isLoading,
    nonceQuery,
    readNonce: async (address: `0x${string}`) => {
      if (!publicClient) {
        return typeof nonceQuery.data === "bigint"
          ? nonceQuery.data
          : BigInt(0);
      }

      return publicClient.readContract({
        ...tradeOrderBookContract,
        functionName: "nonces",
        args: [address],
      });
    },
    readOrderId: async (order: ChainTradeOrder) => {
      if (!publicClient) {
        throw new Error("Public client is unavailable.");
      }

      return publicClient.readContract({
        ...tradeOrderBookContract,
        functionName: "getOrderId",
        args: [order],
      });
    },
    readOrder: async (orderId: `0x${string}`) => {
      if (!publicClient) {
        throw new Error("Public client is unavailable.");
      }

      return publicClient.readContract({
        ...tradeOrderBookContract,
        functionName: "getOrder",
        args: [orderId],
      });
    },
  };
}
