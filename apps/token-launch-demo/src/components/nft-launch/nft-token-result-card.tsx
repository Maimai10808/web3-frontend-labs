"use client";

import type { NftMintResult } from "@/lib/nft-launch/types";

type NftTokenResultCardProps = {
  result: NftMintResult | null;
};

export function NftTokenResultCard({ result }: NftTokenResultCardProps) {
  if (!result) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
        Mint result will appear here after the transaction succeeds.
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
      <div className="text-sm font-semibold text-emerald-100">
        Mint Success
      </div>
      <ResultRow label="Transaction Hash" value={result.txHash} />
      <ResultRow label="Receiver" value={result.receiver} />
      <ResultRow label="Token ID" value={result.tokenId?.toString() ?? "-"} />
      <ResultRow label="Token URI" value={result.tokenURI ?? "-"} />
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gray-950 p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="break-all text-sm text-white">{value}</div>
    </div>
  );
}
