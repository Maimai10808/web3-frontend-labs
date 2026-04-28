"use client";

import { useQuery } from "@tanstack/react-query";
import type { Order } from "@/lib/trade/types";

export type OrdersResponse = {
  orders: Order[];
  total: number;
  receivedAt: number;
};

async function fetchOrders(): Promise<OrdersResponse> {
  const response = await fetch("/api/trade/orders", {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Failed to fetch orders.");
  }

  return data;
}

export function useOrders() {
  return useQuery({
    queryKey: ["trade", "orders"],
    queryFn: fetchOrders,
    refetchOnWindowFocus: false,
  });
}
