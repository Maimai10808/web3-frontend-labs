"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

import { mapStoredOrderToUiOrder, tradeOrderBookContract } from "@/lib/contracts/trade-order-book";
import type { Order } from "@/lib/trade/types";

export type OrdersResponse = {
  orders: Order[];
  total: number;
  receivedAt: number;
};

export function useOrders() {
  const publicClient = usePublicClient({
    chainId: tradeOrderBookContract.chainId,
  });

  return useQuery({
    queryKey: ["trade", "orders", "chain"],
    queryFn: async (): Promise<OrdersResponse> => {
      if (!publicClient) {
        return {
          orders: [],
          total: 0,
          receivedAt: Date.now(),
        };
      }

      const submittedLogs = await publicClient.getContractEvents({
        ...tradeOrderBookContract,
        eventName: "OrderSubmitted",
        fromBlock: BigInt(0),
      });

      const orders = await Promise.all(
        submittedLogs.map(async (log) => {
          const orderId = log.args.orderId;

          if (!orderId) {
            return null;
          }

          const storedOrder = await publicClient.readContract({
            ...tradeOrderBookContract,
            functionName: "getOrder",
            args: [orderId],
          });

          return mapStoredOrderToUiOrder({
            orderId,
            storedOrder,
            txHash: log.transactionHash,
          });
        }),
      );

      const normalizedOrders = orders
        .filter((order): order is Order => Boolean(order))
        .sort((a, b) => b.createdAt - a.createdAt);

      return {
        orders: normalizedOrders,
        total: normalizedOrders.length,
        receivedAt: Date.now(),
      };
    },
    enabled: Boolean(publicClient),
    refetchOnWindowFocus: false,
  });
}
