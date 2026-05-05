"use client";

import type { VerifyTaskResult } from "@/lib/campaign/types";

type TaskVerificationResultProps = {
  result: VerifyTaskResult | null;
};

export function TaskVerificationResult({
  result,
}: TaskVerificationResultProps) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
        Verify a task to see the latest result.
      </div>
    );
  }

  const isSuccess = result.status === "verified";

  return (
    <div
      className={`rounded-2xl border p-4 text-sm ${
        isSuccess
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
          : "border-red-500/20 bg-red-500/10 text-red-100"
      }`}
    >
      <div className="font-medium">
        {isSuccess ? "Verification succeeded" : "Verification failed"}
      </div>
      <div className="mt-1">{result.message}</div>
      <div className="mt-2 text-xs opacity-80">
        Points awarded: {result.pointsAwarded}
      </div>
    </div>
  );
}
