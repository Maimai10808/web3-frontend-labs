"use client";

import type { ReferralStats } from "@/lib/campaign/types";

type ReferralPointsCardProps = {
  referralStats: ReferralStats | null;
  isLoading?: boolean;
  errorMessage?: string | null;
};

export function ReferralPointsCard({
  referralStats,
  isLoading = false,
  errorMessage = null,
}: ReferralPointsCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Referral Stats</h2>
      <p className="mt-1 text-sm text-gray-400">
        Track invited users, referral points, and reward multiplier.
      </p>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-gray-950 p-4 text-sm text-gray-300">
          Loading referral stats...
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage && !referralStats ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          Connect wallet to load referral stats.
        </div>
      ) : null}

      {referralStats ? (
        <div className="mt-4 grid gap-3">
          <MetricRow
            label="Invited Count"
            value={String(referralStats.invitedCount)}
          />
          <MetricRow
            label="Referral Points"
            value={String(referralStats.referralPoints)}
          />
          <MetricRow
            label="Reward Multiplier"
            value={`${referralStats.rewardMultiplier}x`}
          />
          <MetricRow label="Referral Code" value={referralStats.referralCode} />
        </div>
      ) : null}
    </section>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gray-950 p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="break-all text-sm text-white">{value}</div>
    </div>
  );
}
