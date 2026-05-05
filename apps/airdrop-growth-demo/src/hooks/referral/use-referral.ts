"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { ReferralStats } from "@/lib/campaign/types";
import { buildReferralLink } from "@/lib/referral/build-referral-link";

type ReferralResponse = {
  ok: boolean;
  message?: string;
  result?: ReferralStats;
};

const REFERRAL_VISITOR_ID_KEY = "airdrop-growth-demo:referral-visitor-id";

function getOrCreateReferralVisitorId() {
  const stored = window.localStorage.getItem(REFERRAL_VISITOR_ID_KEY);

  if (stored) {
    return stored;
  }

  const visitorId = `visitor:${crypto.randomUUID()}`;
  window.localStorage.setItem(REFERRAL_VISITOR_ID_KEY, visitorId);
  return visitorId;
}

export function useReferral() {
  const { address } = useAccount();
  const trackedReferralRef = useRef<string | null>(null);

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
    refetchInterval: 5_000,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const ref = new URLSearchParams(window.location.search).get("ref");

    if (!ref || !/^0x[a-fA-F0-9]{40}$/.test(ref)) {
      return;
    }

    const refereeId = address ?? getOrCreateReferralVisitorId();
    const trackingKey = `${ref.toLowerCase()}:${refereeId.toLowerCase()}`;

    if (trackedReferralRef.current === trackingKey) {
      return;
    }

    trackedReferralRef.current = trackingKey;

    void fetch("/api/referral", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        inviter: ref,
        refereeId,
      }),
    }).then(() => {
      void query.refetch();
    });
  }, [address, query]);

  return {
    referralStats: query.data ?? null,
    referralLink,
    isLoadingReferral: query.isLoading,
    referralError: query.error,
    refetchReferral: query.refetch,
  };
}
