"use client";

import { useEffect, useState } from "react";
import { useTokenInfo } from "@/hooks/token-launch/use-token-info";

type TokenInfoReaderProps = {
  defaultTokenAddress?: string;
};

export function TokenInfoReader({
  defaultTokenAddress = "",
}: TokenInfoReaderProps) {
  const [inputValue, setInputValue] = useState(defaultTokenAddress);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(defaultTokenAddress);
  }, [defaultTokenAddress]);

  const { tokenInfo, isLoadingTokenInfo, tokenInfoError, refetchTokenInfo } =
    useTokenInfo({
      tokenAddress: inputValue.trim() || undefined,
    });

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h3 className="mb-3 text-base font-semibold text-white">
        Token Info Reader
      </h3>

      <div className="mb-4 flex flex-col gap-3">
        <input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Enter token address"
          className="rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
        />

        <button
          onClick={() => {
            void refetchTokenInfo();
          }}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-500"
        >
          Read Token Info
        </button>
      </div>

      {isLoadingTokenInfo ? (
        <div className="rounded-xl border border-white/10 bg-gray-950 p-3 text-sm text-gray-300">
          Loading token info...
        </div>
      ) : null}

      {tokenInfoError ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {tokenInfoError instanceof Error
            ? tokenInfoError.message
            : "Failed to read token info."}
        </div>
      ) : null}

      {tokenInfo ? (
        <div className="grid gap-3">
          <InfoRow label="Token Address" value={tokenInfo.tokenAddress} />
          <InfoRow label="Creator" value={tokenInfo.creator} />
          <InfoRow label="Owner" value={tokenInfo.owner} />
          <InfoRow label="Name" value={tokenInfo.name} />
          <InfoRow label="Symbol" value={tokenInfo.symbol} />
          <InfoRow label="Total Supply" value={tokenInfo.totalSupply} />
          <InfoRow label="Max Supply" value={tokenInfo.maxSupply} />
          <InfoRow label="Metadata URL" value={tokenInfo.metadataUrl} />
          <InfoRow
            label="Created At"
            value={new Date(tokenInfo.createdAt * 1000).toLocaleString()}
          />
        </div>
      ) : null}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gray-950 p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="break-all text-sm text-white">{value}</div>
    </div>
  );
}
