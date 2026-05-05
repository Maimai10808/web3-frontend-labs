"use client";

import type { ClaimResult } from "@/lib/campaign/types";

type ClaimResultCardProps = {
  result: ClaimResult | null;
};

export function ClaimResultCard({ result }: ClaimResultCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Claim Result</h2>
      <p className="mt-1 text-sm text-gray-400">
        Transaction result and reward state after claiming.
      </p>

      {result ? (
        <div className="mt-4 grid gap-3">
          <MetricRow label="Transaction Hash" value={result.txHash} />
          <MetricRow label="Reward Type" value={result.rewardType} />
          <MetricRow label="Claimed Amount" value={result.amount ?? "-"} />
          <MetricRow
            label="Wallet Reward Balance"
            value={result.rewardBalance ?? "-"}
          />
          <MetricRow
            label="Claimed State"
            value={result.hasClaimed ? "claimed" : "unclaimed"}
          />
          <MetricRow
            label="Claimed At"
            value={new Date(result.claimedAt).toLocaleString()}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          Claim result will appear here after a successful transaction.
        </div>
      )}
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
