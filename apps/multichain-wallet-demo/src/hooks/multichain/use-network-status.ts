"use client";

import { useQuery } from "@tanstack/react-query";
import { useWalletAccount } from "./use-wallet-account";

export function useNetworkStatus() {
  const { adapter } = useWalletAccount();

  const query = useQuery({
    queryKey: ["network-status", adapter?.ecosystem],
    queryFn: async () => {
      if (!adapter) return null;
      return adapter.getNetworkStatus();
    },
    enabled: !!adapter,
  });

  return {
    status: query.data,
    isLoading: query.isLoading,
    refresh: query.refetch,
    adapter,
  };
}
