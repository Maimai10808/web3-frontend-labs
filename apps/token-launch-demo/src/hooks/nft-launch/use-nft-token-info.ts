"use client";

import { useMemo } from "react";
import { zeroAddress, type Address } from "viem";
import { useReadContract } from "wagmi";

import { nftCollectionContract } from "@/lib/contracts/nft-contracts";

type UseNftTokenInfoParams = {
  tokenId?: bigint | number | string | null;
  owner?: Address | null;
  enabled?: boolean;
};

function normalizeTokenId(tokenId: UseNftTokenInfoParams["tokenId"]) {
  if (tokenId === null || tokenId === undefined || tokenId === "") {
    return null;
  }

  try {
    return BigInt(tokenId);
  } catch {
    return null;
  }
}

export function useNftTokenInfo({
  tokenId,
  owner,
  enabled = true,
}: UseNftTokenInfoParams) {
  const normalizedTokenId = useMemo(() => normalizeTokenId(tokenId), [tokenId]);
  const canReadToken = enabled && normalizedTokenId !== null;
  const canReadBalance = canReadToken && Boolean(owner);

  const ownerOfQuery = useReadContract({
    ...nftCollectionContract,
    functionName: "ownerOf",
    args: [normalizedTokenId ?? BigInt(0)],
    query: {
      enabled: canReadToken,
    },
  });

  const tokenURIQuery = useReadContract({
    ...nftCollectionContract,
    functionName: "tokenURI",
    args: [normalizedTokenId ?? BigInt(0)],
    query: {
      enabled: canReadToken,
    },
  });

  const balanceOfQuery = useReadContract({
    ...nftCollectionContract,
    functionName: "balanceOf",
    args: [owner ?? zeroAddress],
    query: {
      enabled: canReadBalance,
    },
  });

  const queryError =
    ownerOfQuery.error ?? tokenURIQuery.error ?? balanceOfQuery.error ?? null;

  return {
    ownerOf: ownerOfQuery.data ?? null,
    tokenURI: tokenURIQuery.data ?? null,
    balanceOf: balanceOfQuery.data ?? null,
    isLoading:
      ownerOfQuery.isLoading ||
      tokenURIQuery.isLoading ||
      balanceOfQuery.isLoading,
    isError:
      ownerOfQuery.isError || tokenURIQuery.isError || balanceOfQuery.isError,
    error: queryError,
    refetch: async () => {
      const results = await Promise.all([
        ownerOfQuery.refetch(),
        tokenURIQuery.refetch(),
        balanceOfQuery.refetch(),
      ]);

      return results;
    },
    ownerOfQuery,
    tokenURIQuery,
    balanceOfQuery,
  };
}
