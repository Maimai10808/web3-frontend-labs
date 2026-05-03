"use client";

import { useMutation } from "@tanstack/react-query";
import type { UploadedNftImageResult } from "@/lib/nft-launch/types";

type UploadNftImageResponse = {
  ok: boolean;
  type: "file";
  ipfsHash: string;
  gatewayUrl: string;
  message?: string;
};

export function useUploadNftImage() {
  const mutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedNftImageResult> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadNftImageResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "NFT image upload failed.");
      }

      return {
        imageURI: payload.gatewayUrl,
        imageHash: payload.ipfsHash,
      };
    },
  });

  return {
    uploadNftImage: mutation.mutateAsync,
    uploadedNftImage: mutation.data ?? null,
    isUploadingNftImage: mutation.isPending,
    uploadNftImageError: mutation.error,
    resetUploadNftImage: mutation.reset,
  };
}
