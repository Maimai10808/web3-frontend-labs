"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePublicClient, useWatchContractEvent } from "wagmi";

import {
  createChainOrderEvent,
  mapStoredOrderToUiOrder,
  tradeOrderBookContract,
} from "@/lib/contracts/trade-order-book";
import type { Order, OrderEvent } from "@/lib/trade/types";
import type { OrdersResponse } from "./useOrders";
import { useTradeLogStore } from "./useTradeLogStore";

function upsertOrder(orders: Order[], nextOrder: Order) {
  const exists = orders.some((order) => order.orderId === nextOrder.orderId);

  if (!exists) {
    return [nextOrder, ...orders];
  }

  return orders.map((order) =>
    order.orderId === nextOrder.orderId ? nextOrder : order,
  );
}

export function useOrderEvents(params?: {
  onEvent?: (event: OrderEvent) => void;
  enabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient({
    chainId: tradeOrderBookContract.chainId,
  });
  const enabled = params?.enabled ?? true;

  useWatchContractEvent({
    ...tradeOrderBookContract,
    enabled,
    onLogs: async (logs) => {
      if (!publicClient) {
        return;
      }

      for (const log of logs) {
        const orderId = log.args.orderId;

        if (!orderId) {
          continue;
        }

        const storedOrder = await publicClient.readContract({
          ...tradeOrderBookContract,
          functionName: "getOrder",
          args: [orderId],
        });

        const nextOrder = mapStoredOrderToUiOrder({
          orderId,
          storedOrder,
          txHash: log.transactionHash,
        });

        const nextEvent = createChainOrderEvent({
          eventName: log.eventName,
          order: nextOrder,
        });

        useTradeLogStore.getState().recordOrderEvent(nextEvent);

        queryClient.setQueryData<OrdersResponse>(
          ["trade", "orders", "chain"],
          (current) => {
            if (!current) {
              return {
                orders: [nextOrder],
                total: 1,
                receivedAt: Date.now(),
              };
            }

            const nextOrders = upsertOrder(current.orders, nextOrder);

            return {
              ...current,
              orders: nextOrders,
              total: nextOrders.length,
              receivedAt: Date.now(),
            };
          },
        );

        params?.onEvent?.(nextEvent);
      }
    },
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return () => {
      void queryClient.invalidateQueries({
        queryKey: ["trade", "orders", "chain"],
      });
    };
  }, [enabled, queryClient]);
}
