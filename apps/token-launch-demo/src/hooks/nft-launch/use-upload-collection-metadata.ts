"use client";

import { useMutation } from "@tanstack/react-query";
import type {
  NftCollectionMetadata,
  UploadedCollectionMetadataResult,
} from "@/lib/nft-launch/types";

type UploadCollectionMetadataResponse = {
  ok: boolean;
  type: "json";
  ipfsHash: string;
  gatewayUrl: string;
  message?: string;
};

export function useUploadCollectionMetadata() {
  const mutation = useMutation({
    mutationFn: async (
      metadata: NftCollectionMetadata,
    ): Promise<UploadedCollectionMetadataResult> => {
      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          metadata,
          fileName: `nft-collection-${Date.now()}.json`,
        }),
      });

      const payload =
        (await response.json()) as UploadCollectionMetadataResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.message ?? "Collection metadata upload failed.",
        );
      }

      return {
        contractURI: `ipfs://${payload.ipfsHash}`,
        metadataHash: payload.ipfsHash,
        metadataGatewayUrl: payload.gatewayUrl,
        metadata,
      };
    },
  });

  return {
    uploadCollectionMetadata: mutation.mutateAsync,
    uploadedCollectionMetadata: mutation.data ?? null,
    isUploadingCollectionMetadata: mutation.isPending,
    uploadCollectionMetadataError: mutation.error,
    resetUploadCollectionMetadata: mutation.reset,
  };
}
