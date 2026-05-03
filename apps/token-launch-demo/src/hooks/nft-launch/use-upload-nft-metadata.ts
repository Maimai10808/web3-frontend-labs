"use client";

import { useMutation } from "@tanstack/react-query";
import type {
  NftMetadata,
  UploadedNftMetadataResult,
} from "@/lib/nft-launch/types";

type UploadNftMetadataResponse = {
  ok: boolean;
  type: "json";
  ipfsHash: string;
  gatewayUrl: string;
  message?: string;
};

export function useUploadNftMetadata() {
  const mutation = useMutation({
    mutationFn: async (
      metadata: NftMetadata,
    ): Promise<UploadedNftMetadataResult> => {
      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          metadata,
          fileName: `nft-metadata-${Date.now()}.json`,
        }),
      });

      const payload = (await response.json()) as UploadNftMetadataResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "NFT metadata upload failed.");
      }

      return {
        metadataURI: payload.gatewayUrl,
        metadataHash: payload.ipfsHash,
        metadata,
      };
    },
  });

  return {
    uploadNftMetadata: mutation.mutateAsync,
    uploadedNftMetadata: mutation.data ?? null,
    isUploadingNftMetadata: mutation.isPending,
    uploadNftMetadataError: mutation.error,
    resetUploadNftMetadata: mutation.reset,
  };
}
