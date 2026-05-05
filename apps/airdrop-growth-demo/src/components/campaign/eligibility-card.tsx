"use client";

import type { EligibilityResult } from "@/lib/campaign/types";

type EligibilityCardProps = {
  eligibility: EligibilityResult | null;
  isLoading?: boolean;
  errorMessage?: string | null;
};

export function EligibilityCard({
  eligibility,
  isLoading = false,
  errorMessage = null,
}: EligibilityCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Eligibility</h2>
      <p className="mt-1 text-sm text-gray-400">
        Campaign qualification is derived from completed tasks and total points.
      </p>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-gray-950 p-4 text-sm text-gray-300">
          Calculating eligibility...
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage && !eligibility ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          Eligibility data is not available yet.
        </div>
      ) : null}

      {eligibility ? (
        <div className="mt-4 grid gap-3">
          <MetricRow
            label="Qualification"
            value={eligibility.qualified ? "Qualified" : "Not qualified"}
          />
          <MetricRow
            label="Total Points"
            value={String(eligibility.totalPoints)}
          />
          <MetricRow
            label="Threshold"
            value={String(eligibility.pointsThreshold)}
          />
          <MetricRow label="Claim Status" value={eligibility.claimStatus} />
          <MetricRow
            label="Reason"
            value={eligibility.reason ?? "Requirements satisfied."}
          />
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
