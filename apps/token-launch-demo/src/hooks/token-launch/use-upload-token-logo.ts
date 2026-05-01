"use client";

import { useMutation } from "@tanstack/react-query";
import type { UploadedTokenLogo } from "@/lib/token-launch/types";

type UploadTokenLogoResponse = {
  ok: boolean;
  type: "file";
  ipfsHash: string;
  gatewayUrl: string;
  message?: string;
};

export function useUploadTokenLogo() {
  const mutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedTokenLogo> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadTokenLogoResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Logo upload failed.");
      }

      return {
        imageUrl: payload.gatewayUrl,
        imageHash: payload.ipfsHash,
      };
    },
  });

  return {
    uploadTokenLogo: mutation.mutateAsync,
    uploadedLogo: mutation.data ?? null,
    isUploadingLogo: mutation.isPending,
    uploadLogoError: mutation.error,
    resetUploadTokenLogo: mutation.reset,
  };
}
