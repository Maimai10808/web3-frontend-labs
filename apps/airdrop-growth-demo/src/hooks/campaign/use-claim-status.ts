"use client";

import { useQuery } from "@tanstack/react-query";
import type { ClaimStatus, GrowthTask } from "@/lib/campaign/types";
import {
  AIRDROP_GROWTH_CLAIM_DEADLINE,
  AIRDROP_GROWTH_POINTS_THRESHOLD,
} from "@/lib/campaign/constants";
import { calculateEligibility } from "@/lib/campaign/calculate-eligibility";

type UseClaimStatusParams = {
  tasks: GrowthTask[];
  hasClaimed?: boolean;
  claimDeadline?: number;
  pointsThreshold?: number;
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
      const result = calculateEligibility({
        tasks,
        hasClaimed,
        claimDeadline,
        pointsThreshold,
      });

      return result.claimStatus;
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
