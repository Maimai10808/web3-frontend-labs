"use client";

import type { ClaimStatus } from "@/lib/campaign/types";
import { useClaimReward } from "@/hooks/claim/use-claim-reward";
import { ClaimResultCard } from "./claim-result-card";

type ClaimRewardCardProps = {
  claimStatus: ClaimStatus;
};

export function ClaimRewardCard({ claimStatus }: ClaimRewardCardProps) {
  const { claimReward, claimRewardResult, isClaimingReward, claimRewardError } =
    useClaimReward();

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

        {claimRewardError ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {claimRewardError instanceof Error
              ? claimRewardError.message
              : "Failed to claim reward."}
          </div>
        ) : null}

        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              void claimReward();
            }}
            disabled={!canClaim || isClaimingReward}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isClaimingReward ? "Claiming..." : "Claim Reward"}
          </button>
        </div>
      </section>

      <ClaimResultCard result={claimRewardResult} />
    </div>
  );
}
