"use client";

import type { ClaimResult, ClaimStatus } from "@/lib/campaign/types";
import { ClaimResultCard } from "./claim-result-card";

type ClaimRewardCardProps = {
  claimStatus: ClaimStatus;
  onClaim: () => void | Promise<void>;
  result: ClaimResult | null;
  isClaiming: boolean;
  errorMessage?: string | null;
};

export function ClaimRewardCard({
  claimStatus,
  onClaim,
  result,
  isClaiming,
  errorMessage = null,
}: ClaimRewardCardProps) {
  const canClaim = claimStatus === "claimable";

  return (
    <div className="grid gap-4">
      <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
        <h2 className="text-lg font-semibold text-white">Claim Reward</h2>
        <p className="mt-1 text-sm text-gray-400">
          Claim the ERC20 campaign reward once your wallet becomes eligible.
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-gray-950 p-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
            Current Status
          </div>
          <div className="text-sm text-white">{claimStatus}</div>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              void onClaim();
            }}
            disabled={!canClaim || isClaiming}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isClaiming ? "Claiming..." : "Claim Reward"}
          </button>
        </div>
      </section>

      <ClaimResultCard result={result} />
    </div>
  );
}
