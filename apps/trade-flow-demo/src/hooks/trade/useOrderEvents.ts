"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  const enabled = params?.enabled ?? true;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const eventSource = new EventSource("/api/trade/stream");

    function handleOrderEvent(event: MessageEvent) {
      const parsed = JSON.parse(event.data) as OrderEvent;

      useTradeLogStore.getState().recordOrderEvent(parsed);

      queryClient.setQueryData<OrdersResponse>(
        ["trade", "orders"],
        (current) => {
          if (!current) {
            return {
              orders: [parsed.order],
              total: 1,
              receivedAt: Date.now(),
            };
          }

          const nextOrders = upsertOrder(current.orders, parsed.order);

          return {
            ...current,
            orders: nextOrders,
            total: nextOrders.length,
            receivedAt: Date.now(),
          };
        },
      );

      params?.onEvent?.(parsed);
    }

    eventSource.addEventListener("order.created", handleOrderEvent);
    eventSource.addEventListener("order.updated", handleOrderEvent);

    eventSource.onerror = () => {
      console.error("[SSE] Order event stream error.");
    };

    return () => {
      eventSource.removeEventListener("order.created", handleOrderEvent);
      eventSource.removeEventListener("order.updated", handleOrderEvent);
      eventSource.close();
    };
  }, [enabled, params, queryClient]);
}
