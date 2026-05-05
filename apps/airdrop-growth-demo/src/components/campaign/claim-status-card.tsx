"use client";

import type { ClaimStatus } from "@/lib/campaign/types";

type ClaimStatusCardProps = {
  claimStatus: ClaimStatus;
  isLoading?: boolean;
  errorMessage?: string | null;
};

export function ClaimStatusCard({
  claimStatus,
  isLoading = false,
  errorMessage = null,
}: ClaimStatusCardProps) {
  const tone = getClaimStatusTone(claimStatus);

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Claim Status</h2>
      <p className="mt-1 text-sm text-gray-400">
        This status controls whether the wallet can claim the campaign reward.
      </p>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-gray-950 p-4 text-sm text-gray-300">
          Loading claim status...
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-gray-950 p-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
            Current State
          </div>
          <div
            className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${tone}`}
          >
            {claimStatus}
          </div>
          <p className="mt-3 text-sm text-gray-300">
            {getClaimStatusDescription(claimStatus)}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function getClaimStatusTone(status: ClaimStatus): string {
  switch (status) {
    case "claimable":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
    case "claimed":
      return "border-blue-500/20 bg-blue-500/10 text-blue-100";
    case "expired":
      return "border-red-500/20 bg-red-500/10 text-red-100";
    case "unqualified":
    default:
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-100";
  }
}

function getClaimStatusDescription(status: ClaimStatus): string {
  switch (status) {
    case "claimable":
      return "The wallet has enough points and can claim the reward now.";
    case "claimed":
      return "The reward has already been claimed for this wallet.";
    case "expired":
      return "The campaign claim window has ended.";
    case "unqualified":
    default:
      return "The wallet has not reached the claim threshold yet.";
  }
}
