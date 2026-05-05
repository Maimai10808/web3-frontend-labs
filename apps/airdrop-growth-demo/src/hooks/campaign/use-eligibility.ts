"use client";

import { useQuery } from "@tanstack/react-query";
import type { EligibilityResult, GrowthTask } from "@/lib/campaign/types";
import {
  AIRDROP_GROWTH_CLAIM_DEADLINE,
  AIRDROP_GROWTH_POINTS_THRESHOLD,
} from "@/lib/campaign/constants";

type UseEligibilityParams = {
  tasks: GrowthTask[];
  hasClaimed?: boolean;
  claimDeadline?: number;
  pointsThreshold?: number;
};

type EligibilityResponse = {
  ok: boolean;
  message?: string;
  result?: EligibilityResult;
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
      const response = await fetch("/api/campaign/eligibility", {
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

      const payload = (await response.json()) as EligibilityResponse;

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message ?? "Failed to load eligibility.");
      }

      return payload.result;
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
