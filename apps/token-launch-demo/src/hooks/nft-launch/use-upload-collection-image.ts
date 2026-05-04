"use client";

import { useMutation } from "@tanstack/react-query";
import type { UploadedCollectionImageResult } from "@/lib/nft-launch/types";

type UploadCollectionImageResponse = {
  ok: boolean;
  type: "file";
  ipfsHash: string;
  gatewayUrl: string;
  message?: string;
};

export function useUploadCollectionImage() {
  const mutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedCollectionImageResult> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadCollectionImageResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Collection image upload failed.");
      }

      return {
        imageURI: `ipfs://${payload.ipfsHash}`,
        imageHash: payload.ipfsHash,
        imageGatewayUrl: payload.gatewayUrl,
      };
    },
  });

  return {
    uploadCollectionImage: mutation.mutateAsync,
    uploadedCollectionImage: mutation.data ?? null,
    isUploadingCollectionImage: mutation.isPending,
    uploadCollectionImageError: mutation.error,
    resetUploadCollectionImage: mutation.reset,
  };
}
