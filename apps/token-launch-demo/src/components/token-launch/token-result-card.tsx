"use client";

import type { CreateTokenResult } from "@/lib/token-launch/types";

type TokenResultCardProps = {
  result: CreateTokenResult | null;
};

export function TokenResultCard({ result }: TokenResultCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h3 className="mb-3 text-base font-semibold text-white">
        Token Launch Result
      </h3>

      {result ? (
        <div className="grid gap-3">
          <ResultRow label="Transaction Hash" value={result.txHash} />
          <ResultRow label="Token Address" value={result.tokenAddress} />
          <ResultRow label="Metadata URL" value={result.metadataUrl} />
          {result.tokenName ? (
            <ResultRow label="Name" value={result.tokenName} />
          ) : null}
          {result.tokenSymbol ? (
            <ResultRow label="Symbol" value={result.tokenSymbol} />
          ) : null}
          {result.maxSupply ? (
            <ResultRow label="Max Supply" value={result.maxSupply} />
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          Launch result will appear here after the create transaction succeeds.
        </div>
      )}
    </section>
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
