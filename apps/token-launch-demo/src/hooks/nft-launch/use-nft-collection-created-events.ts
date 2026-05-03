"use client";

import { useCallback, useEffect, useState } from "react";
import { getAbiItem, type Address, type Hash } from "viem";
import { usePublicClient } from "wagmi";

import {
  nftCollectionCreatedEventName,
  nftCollectionFactoryChainId,
  nftCollectionFactoryContract,
} from "@/lib/contracts/nft-contracts";

export type NftCollectionCreatedEvent = {
  creator: Address;
  collection: Address;
  name: string;
  symbol: string;
  contractURI: string;
  baseTokenURI: string;
  maxSupply: bigint;
  mintPrice: bigint;
  txHash: Hash;
  blockNumber: bigint;
};

type CollectionCreatedArgs = {
  creator?: Address;
  collection?: Address;
  name?: string;
  symbol?: string;
  contractURI?: string;
  baseTokenURI?: string;
  maxSupply?: bigint;
  mintPrice?: bigint;
};

type CollectionCreatedLog = {
  args?: CollectionCreatedArgs;
  transactionHash?: Hash;
  blockNumber?: bigint;
};

function normalizeCollectionCreatedLog(
  log: CollectionCreatedLog,
): NftCollectionCreatedEvent | null {
  const args = log.args;

  if (
    !args?.creator ||
    !args.collection ||
    !args.name ||
    !args.symbol ||
    !args.contractURI ||
    !args.baseTokenURI ||
    args.maxSupply === undefined ||
    args.mintPrice === undefined ||
    !log.transactionHash ||
    log.blockNumber === undefined
  ) {
    return null;
  }

  return {
    creator: args.creator,
    collection: args.collection,
    name: args.name,
    symbol: args.symbol,
    contractURI: args.contractURI,
    baseTokenURI: args.baseTokenURI,
    maxSupply: args.maxSupply,
    mintPrice: args.mintPrice,
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
  };
}

function mergeEvents(
  current: NftCollectionCreatedEvent[],
  next: NftCollectionCreatedEvent[],
) {
  const eventsByKey = new Map<string, NftCollectionCreatedEvent>();

  for (const event of [...current, ...next]) {
    eventsByKey.set(
      `${event.txHash}-${event.collection.toLowerCase()}`,
      event,
    );
  }

  return Array.from(eventsByKey.values()).sort((a, b) => {
    if (a.blockNumber === b.blockNumber) {
      return 0;
    }

    return a.blockNumber > b.blockNumber ? -1 : 1;
  });
}

export function useNftCollectionCreatedEvents() {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<NftCollectionCreatedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!publicClient) {
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const logs = await publicClient.getLogs({
        address: nftCollectionFactoryContract.address,
        event: getAbiItem({
          abi: nftCollectionFactoryContract.abi,
          name: nftCollectionCreatedEventName,
        }),
        fromBlock:
          nftCollectionFactoryChainId === 31337 ? BigInt(0) : undefined,
        toBlock: "latest",
      });

      const normalized = logs
        .map((log) => normalizeCollectionCreatedLog(log))
        .filter((event): event is NftCollectionCreatedEvent => {
          return event !== null;
        });

      setEvents(mergeEvents([], normalized));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError
          : new Error("Failed to read CollectionCreated events."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refetch();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refetch]);

  useEffect(() => {
    if (!publicClient) {
      return;
    }

    const unwatch = publicClient.watchContractEvent({
      address: nftCollectionFactoryContract.address,
      abi: nftCollectionFactoryContract.abi,
      eventName: nftCollectionCreatedEventName,
      onLogs: (logs) => {
        const normalized = logs
          .map((log) => normalizeCollectionCreatedLog(log))
          .filter((event): event is NftCollectionCreatedEvent => {
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
  }, [publicClient]);

  return {
    events,
    isLoading,
    error,
    refetch,
  };
}
