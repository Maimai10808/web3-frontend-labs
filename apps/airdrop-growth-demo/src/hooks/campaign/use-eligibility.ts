"use client";

import { useQuery } from "@tanstack/react-query";
import type { GrowthTask, EligibilityResult } from "@/lib/campaign/types";
import {
  AIRDROP_GROWTH_CLAIM_DEADLINE,
  AIRDROP_GROWTH_POINTS_THRESHOLD,
} from "@/lib/campaign/constants";
import { calculateEligibility } from "@/lib/campaign/calculate-eligibility";

type UseEligibilityParams = {
  tasks: GrowthTask[];
  hasClaimed?: boolean;
  claimDeadline?: number;
  pointsThreshold?: number;
};

export function useEligibility({
  tasks,
  hasClaimed = false,
  claimDeadline = AIRDROP_GROWTH_CLAIM_DEADLINE,
  pointsThreshold = AIRDROP_GROWTH_POINTS_THRESHOLD,
}: UseEligibilityParams) {
  const query = useQuery({
    queryKey: [
      "airdrop-growth-demo",
      "eligibility",
      tasks,
      hasClaimed,
      claimDeadline,
      pointsThreshold,
    ],
    queryFn: async (): Promise<EligibilityResult> => {
      return calculateEligibility({
        tasks,
        hasClaimed,
        claimDeadline,
        pointsThreshold,
      });
    },
    staleTime: 5_000,
  });

  return {
    eligibility: query.data ?? null,
    isLoadingEligibility: query.isLoading,
    eligibilityError: query.error,
    refetchEligibility: query.refetch,
  };
}
