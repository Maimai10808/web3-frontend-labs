"use client";

import { useQuery } from "@tanstack/react-query";
import type { LeaderboardItem } from "@/lib/campaign/types";

type LeaderboardResponse = {
  ok: boolean;
  message?: string;
  result?: LeaderboardItem[];
};

export function useLeaderboard() {
  const query = useQuery({
    queryKey: ["airdrop-growth-demo", "leaderboard"],
    queryFn: async (): Promise<LeaderboardItem[]> => {
      const response = await fetch("/api/leaderboard");
      const payload = (await response.json()) as LeaderboardResponse;

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message ?? "Failed to load leaderboard.");
      }

      return payload.result;
    },
    staleTime: 15_000,
  });

  return {
    leaderboard: query.data ?? [],
    isLoadingLeaderboard: query.isLoading,
    leaderboardError: query.error,
    refetchLeaderboard: query.refetch,
  };
}
