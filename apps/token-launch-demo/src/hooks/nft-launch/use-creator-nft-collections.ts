"use client";

import { useReadContract, useAccount } from "wagmi";
import type { Address } from "viem";

import { nftCollectionFactoryContract } from "@/lib/contracts/nft-contracts";

export function useCreatorNftCollections() {
  const account = useAccount();

  const query = useReadContract({
    ...nftCollectionFactoryContract,
    functionName: "getCreatorCollections",
    args: account.address ? [account.address] : undefined,
    query: {
      enabled: account.isConnected && Boolean(account.address),
    },
  });

  return {
    collectionAddresses: (query.data ?? []) as Address[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
