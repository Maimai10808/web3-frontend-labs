"use client";

import { useMutation } from "@tanstack/react-query";
import { buildTokenMetadata } from "@/lib/token-launch/build-metadata";
import type {
  TokenMetadataInput,
  UploadedTokenMetadata,
} from "@/lib/token-launch/types";

type UploadTokenMetadataResponse = {
  ok: boolean;
  type: "json";
  ipfsHash: string;
  gatewayUrl: string;
  message?: string;
};

type UploadTokenMetadataParams = {
  input: TokenMetadataInput;
  imageUrl: string;
};

export function useUploadTokenMetadata() {
  const mutation = useMutation({
    mutationFn: async ({
      input,
      imageUrl,
    }: UploadTokenMetadataParams): Promise<UploadedTokenMetadata> => {
      const metadata = buildTokenMetadata(input, imageUrl);

      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          metadata,
        }),
      });

      const payload = (await response.json()) as UploadTokenMetadataResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Metadata upload failed.");
      }

      return {
        metadataUrl: payload.gatewayUrl,
        metadataHash: payload.ipfsHash,
        metadata,
      };
    },
  });

  return {
    uploadTokenMetadata: mutation.mutateAsync,
    uploadedMetadata: mutation.data ?? null,
    isUploadingMetadata: mutation.isPending,
    uploadMetadataError: mutation.error,
    resetUploadTokenMetadata: mutation.reset,
  };
}
