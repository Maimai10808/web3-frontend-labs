"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { ReferralStats } from "@/lib/campaign/types";
import { buildReferralLink } from "@/lib/referral/build-referral-link";

type ReferralResponse = {
  ok: boolean;
  message?: string;
  result?: ReferralStats;
};

export function useReferral() {
  const { address } = useAccount();

  const referralLink = useMemo(() => {
    if (!address || typeof window === "undefined") {
      return null;
    }

    return buildReferralLink({
      origin: window.location.origin,
      pathname: "/",
      address,
    });
  }, [address]);

  const query = useQuery({
    queryKey: ["airdrop-growth-demo", "referral", address, referralLink],
    enabled: Boolean(address && referralLink),
    queryFn: async (): Promise<ReferralStats> => {
      const response = await fetch("/api/referral", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          address,
          referralLink,
        }),
      });

      const payload = (await response.json()) as ReferralResponse;

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message ?? "Failed to load referral data.");
      }

      return payload.result;
    },
    staleTime: 15_000,
  });

  return {
    referralStats: query.data ?? null,
    referralLink,
    isLoadingReferral: query.isLoading,
    referralError: query.error,
    refetchReferral: query.refetch,
  };
}
