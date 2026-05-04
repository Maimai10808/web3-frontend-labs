"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import type { Address } from "viem";

import { launchERC721CollectionAbi } from "@/lib/contracts/nft-contracts";
import { resolveIpfsUri } from "@/lib/ipfs/resolve-ipfs-uri";
import type {
  NftCollectionCard,
  NftCollectionMetadata,
} from "@/lib/nft-launch/types";
import type { NftCollectionCreatedEvent } from "./use-nft-collection-created-events";

type UseNftCollectionCardsParams = {
  collectionAddresses: Address[];
  createdEvents?: NftCollectionCreatedEvent[];
};

const collectionReadFunctions = [
  "name",
  "symbol",
  "contractURI",
  "baseTokenURI",
  "maxSupply",
  "totalSupply",
  "totalMinted",
  "mintPrice",
  "nextTokenId",
] as const;

function normalizeMetadata(payload: unknown): NftCollectionMetadata | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const source = payload as Record<string, unknown>;

  return {
    name: typeof source.name === "string" ? source.name : undefined,
    description:
      typeof source.description === "string" ? source.description : undefined,
    image: typeof source.image === "string" ? source.image : undefined,
    external_link:
      typeof source.external_link === "string"
        ? source.external_link
        : undefined,
    external_url:
      typeof source.external_url === "string" ? source.external_url : undefined,
  };
}

async function fetchCollectionMetadata(contractURI: string) {
  const resolved = resolveIpfsUri(contractURI);

  if (!resolved) {
    return null;
  }

  try {
    const response = await fetch(resolved);

    if (!response.ok) {
      return null;
    }

    return normalizeMetadata(await response.json());
  } catch {
    return null;
  }
}

export function useNftCollectionCards({
  collectionAddresses,
  createdEvents = [],
}: UseNftCollectionCardsParams) {
  const contracts = collectionAddresses.flatMap((address) => {
    return collectionReadFunctions.map((functionName) => ({
      address,
      abi: launchERC721CollectionAbi,
      functionName,
    }));
  });

  const collectionReads = useReadContracts({
    allowFailure: true,
    contracts,
    query: {
      enabled: collectionAddresses.length > 0,
    },
  });

  const baseCards = useMemo(() => {
    if (!collectionReads.data) {
      return [];
    }

    return collectionAddresses
      .map((address, index): NftCollectionCard | null => {
        const offset = index * collectionReadFunctions.length;
        const values = collectionReads.data.slice(
          offset,
          offset + collectionReadFunctions.length,
        );

        if (values.some((value) => value.status !== "success")) {
          return null;
        }

        const createdEvent = createdEvents.find((event) => {
          return event.collection.toLowerCase() === address.toLowerCase();
        });

        return {
          address,
          name: values[0]?.result as string,
          symbol: values[1]?.result as string,
          contractURI: values[2]?.result as string,
          baseTokenURI: values[3]?.result as string,
          maxSupply: values[4]?.result as bigint,
          totalSupply: values[5]?.result as bigint,
          totalMinted: values[6]?.result as bigint,
          mintPrice: values[7]?.result as bigint,
          nextTokenId: values[8]?.result as bigint,
          creator: createdEvent?.creator,
          txHash: createdEvent?.txHash,
          blockNumber: createdEvent?.blockNumber,
        };
      })
      .filter((card): card is NftCollectionCard => card !== null);
  }, [collectionAddresses, collectionReads.data, createdEvents]);

  const metadataQueries = useQueries({
    queries: baseCards.map((card) => ({
      queryKey: ["nft-collection-metadata", card.contractURI],
      queryFn: () => fetchCollectionMetadata(card.contractURI),
      enabled: Boolean(card.contractURI),
      staleTime: 60_000,
    })),
  });

  const collections = useMemo(() => {
    return baseCards.map((card, index) => {
      const metadata = metadataQueries[index]?.data ?? null;
      const image = resolveIpfsUri(metadata?.image) ?? undefined;

      return {
        ...card,
        image,
        description: metadata?.description,
        externalUrl: metadata?.external_url ?? metadata?.external_link,
      };
    });
  }, [baseCards, metadataQueries]);

  const refetch = async () => {
    await collectionReads.refetch();
    await Promise.all(metadataQueries.map((query) => query.refetch()));
  };

  return {
    collections,
    isLoading: collectionReads.isLoading,
    isError: collectionReads.isError,
    error: collectionReads.error ?? null,
    refetch,
  };
}
