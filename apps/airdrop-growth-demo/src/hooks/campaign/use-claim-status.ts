"use client";

import { useQuery } from "@tanstack/react-query";
import type { ClaimStatus, GrowthTask } from "@/lib/campaign/types";
import {
  AIRDROP_GROWTH_CLAIM_DEADLINE,
  AIRDROP_GROWTH_POINTS_THRESHOLD,
} from "@/lib/campaign/constants";

type UseClaimStatusParams = {
  tasks: GrowthTask[];
  hasClaimed?: boolean;
  claimDeadline?: number;
  pointsThreshold?: number;
};

type ClaimStatusResponse = {
  ok: boolean;
  message?: string;
  result?: {
    claimStatus: ClaimStatus;
  };
};

export function useClaimStatus({
  tasks,
  hasClaimed = false,
  claimDeadline = AIRDROP_GROWTH_CLAIM_DEADLINE,
  pointsThreshold = AIRDROP_GROWTH_POINTS_THRESHOLD,
}: UseClaimStatusParams) {
  const query = useQuery({
    queryKey: [
      "airdrop-growth-demo",
      "claim-status",
      tasks,
      hasClaimed,
      claimDeadline,
      pointsThreshold,
    ],
    queryFn: async (): Promise<ClaimStatus> => {
      const response = await fetch("/api/campaign/claim-status", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          tasks,
          hasClaimed,
          claimDeadline,
          pointsThreshold,
        }),
      });

      const payload = (await response.json()) as ClaimStatusResponse;

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message ?? "Failed to load claim status.");
      }

      return payload.result.claimStatus;
    },
    staleTime: 5_000,
  });

  return {
    claimStatus: query.data ?? "unqualified",
    isLoadingClaimStatus: query.isLoading,
    claimStatusError: query.error,
    refetchClaimStatus: query.refetch,
  };
}
