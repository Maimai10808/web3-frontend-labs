"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { decodeEventLog, type Address } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

import { useUploadCollectionImage } from "@/hooks/nft-launch/use-upload-collection-image";
import { useUploadCollectionMetadata } from "@/hooks/nft-launch/use-upload-collection-metadata";
import {
  nftCollectionCreatedEventName,
  nftCollectionFactoryAddress,
  nftCollectionFactoryContract,
} from "@/lib/contracts/nft-contracts";
import { buildCollectionMetadata } from "@/lib/nft-launch/build-collection-metadata";
import { buildCreateCollectionArgs } from "@/lib/nft-launch/build-create-collection-args";
import type {
  CreateNftCollectionResult,
  NftCollectionCreateStep,
  ValidatedNftCollectionFormValues,
} from "@/lib/nft-launch/types";

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
  const [step, setStep] = useState<NftCollectionCreateStep>("idle");
  const { uploadCollectionImage, uploadCollectionImageError } =
    useUploadCollectionImage();
  const { uploadCollectionMetadata, uploadCollectionMetadataError } =
    useUploadCollectionMetadata();

  const mutation = useMutation({
    mutationFn: async (
      values: ValidatedNftCollectionFormValues,
    ): Promise<CreateNftCollectionResult> => {
      if (!publicClient) {
        throw new Error("Public client is not ready.");
      }

      setStep("image_uploading");
      const image = await uploadCollectionImage(values.collectionImageFile);

      setStep("metadata_building");
      const metadata = buildCollectionMetadata({
        name: values.name,
        description: values.description,
        externalUrl: values.externalUrl,
        image: image.imageURI,
      });

      setStep("metadata_uploading");
      const uploadedMetadata = await uploadCollectionMetadata(metadata);

      const config = buildCreateCollectionArgs({
        values,
        contractURI: uploadedMetadata.contractURI,
      });

      setStep("wallet_confirming");
      const txHash = await writeContractAsync({
        ...nftCollectionFactoryContract,
        functionName: "createCollection",
        args: [config],
      });

      setStep("tx_confirming");
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
            metadata,
            imageURI: image.imageURI,
            imageGatewayUrl: image.imageGatewayUrl,
          };
        } catch {
          continue;
        }
      }

      throw new Error("CollectionCreated event not found in receipt.");
    },
    onSuccess() {
      setStep("success");
    },
    onError() {
      setStep("error");
    },
  });

  return {
    createCollection: mutation.mutateAsync,
    result: mutation.data ?? null,
    step,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error:
      mutation.error ?? uploadCollectionImageError ?? uploadCollectionMetadataError,
    reset: () => {
      setStep("idle");
      mutation.reset();
    },
  };
}
