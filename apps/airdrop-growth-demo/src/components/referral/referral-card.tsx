"use client";

import { useState } from "react";

type ReferralCardProps = {
  referralLink: string | null;
  isLoading?: boolean;
  errorMessage?: string | null;
};

export function ReferralCard({
  referralLink,
  isLoading = false,
  errorMessage = null,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referralLink) {
      return;
    }

    await navigator.clipboard.writeText(referralLink);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Referral Link</h2>
      <p className="mt-1 text-sm text-gray-400">
        Share your wallet-based invite link to grow campaign points.
      </p>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-gray-950 p-4 text-sm text-gray-300">
          Building referral link...
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
            Invite URL
          </div>
          <div className="break-all text-sm text-white">
            {referralLink ?? "Connect wallet to generate a referral link."}
          </div>

          <button
            type="button"
            onClick={() => {
              void handleCopy();
            }}
            disabled={!referralLink}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
