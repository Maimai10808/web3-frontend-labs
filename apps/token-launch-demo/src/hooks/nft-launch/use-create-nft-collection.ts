"use client";

import { useMutation } from "@tanstack/react-query";
import { decodeEventLog, type Address } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

import {
  nftCollectionCreatedEventName,
  nftCollectionFactoryAddress,
  nftCollectionFactoryContract,
} from "@/lib/contracts/nft-contracts";
import { buildCreateNftCollectionArgs } from "@/lib/token-launch/build-create-nft-collection-args";
import type {
  CreateNftCollectionResult,
  ValidatedNftCollectionFormValues,
} from "@/lib/token-launch/types";

type CollectionCreatedArgs = {
  creator: Address;
  collection: Address;
  name: string;
  symbol: string;
  contractURI: string;
  baseTokenURI: string;
  maxSupply: bigint;
  mintPrice: bigint;
};

export function useCreateNftCollection() {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const mutation = useMutation({
    mutationFn: async (
      values: ValidatedNftCollectionFormValues,
    ): Promise<CreateNftCollectionResult> => {
      if (!publicClient) {
        throw new Error("Public client is not ready.");
      }

      const config = buildCreateNftCollectionArgs(values);

      const txHash = await writeContractAsync({
        ...nftCollectionFactoryContract,
        functionName: "createCollection",
        args: [config],
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== nftCollectionFactoryAddress.toLowerCase()) {
          continue;
        }

        try {
          const decoded = decodeEventLog({
            abi: nftCollectionFactoryContract.abi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName !== nftCollectionCreatedEventName) {
            continue;
          }

          const eventArgs = decoded.args as CollectionCreatedArgs;

          return {
            txHash,
            collectionAddress: eventArgs.collection,
            creator: eventArgs.creator,
            name: eventArgs.name,
            symbol: eventArgs.symbol,
            contractURI: eventArgs.contractURI,
            baseTokenURI: eventArgs.baseTokenURI,
            maxSupply: eventArgs.maxSupply,
            mintPrice: eventArgs.mintPrice,
          };
        } catch {
          continue;
        }
      }

      throw new Error("CollectionCreated event not found in receipt.");
    },
  });

  return {
    createCollection: mutation.mutateAsync,
    result: mutation.data ?? null,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
