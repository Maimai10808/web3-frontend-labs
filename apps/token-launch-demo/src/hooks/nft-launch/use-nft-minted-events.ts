"use client";

import { useCallback, useEffect, useState } from "react";
import { getAbiItem, type Address, type Hash } from "viem";
import { usePublicClient } from "wagmi";

import {
  launchERC721CollectionAbi,
  nftCollectionChainId,
  nftCollectionMintedEventName,
} from "@/lib/contracts/nft-contracts";

export type NftMintedEvent = {
  operator: Address;
  to: Address;
  tokenId: bigint;
  paid: bigint;
  txHash: Hash;
  blockNumber: bigint;
};

type MintedArgs = {
  operator?: Address;
  to?: Address;
  tokenId?: bigint;
  paid?: bigint;
};

type MintedLog = {
  args?: MintedArgs;
  transactionHash?: Hash;
  blockNumber?: bigint;
};

function normalizeMintedLog(log: MintedLog): NftMintedEvent | null {
  const args = log.args;

  if (
    !args?.operator ||
    !args.to ||
    args.tokenId === undefined ||
    args.paid === undefined ||
    !log.transactionHash ||
    log.blockNumber === undefined
  ) {
    return null;
  }

  return {
    operator: args.operator,
    to: args.to,
    tokenId: args.tokenId,
    paid: args.paid,
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
  };
}

function mergeEvents(current: NftMintedEvent[], next: NftMintedEvent[]) {
  const eventsByKey = new Map<string, NftMintedEvent>();

  for (const event of [...current, ...next]) {
    eventsByKey.set(`${event.txHash}-${event.tokenId.toString()}`, event);
  }

  return Array.from(eventsByKey.values()).sort((a, b) => {
    if (a.blockNumber === b.blockNumber) {
      return 0;
    }

    return a.blockNumber > b.blockNumber ? -1 : 1;
  });
}

export function useNftMintedEvents(collectionAddress?: Address | null) {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<NftMintedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!publicClient || !collectionAddress) {
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const logs = await publicClient.getLogs({
        address: collectionAddress,
        event: getAbiItem({
          abi: launchERC721CollectionAbi,
          name: nftCollectionMintedEventName,
        }),
        fromBlock: nftCollectionChainId === 31337 ? BigInt(0) : undefined,
        toBlock: "latest",
      });

      const normalized = logs
        .map((log) => normalizeMintedLog(log))
        .filter((event): event is NftMintedEvent => {
          return event !== null;
        });

      setEvents(mergeEvents([], normalized));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError
          : new Error("Failed to read CollectionMinted events."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [collectionAddress, publicClient]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refetch();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refetch]);

  useEffect(() => {
    if (!publicClient || !collectionAddress) {
      return;
    }

    const unwatch = publicClient.watchContractEvent({
      address: collectionAddress,
      abi: launchERC721CollectionAbi,
      eventName: nftCollectionMintedEventName,
      onLogs: (logs) => {
        const normalized = logs
          .map((log) => normalizeMintedLog(log))
          .filter((event): event is NftMintedEvent => {
            return event !== null;
          });

        if (normalized.length > 0) {
          setEvents((current) => mergeEvents(current, normalized));
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [collectionAddress, publicClient]);

  return {
    events,
    isLoading,
    error,
    refetch,
  };
}
