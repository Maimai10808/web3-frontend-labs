"use client";

import { useNftTokenInfo } from "@/hooks/nft-launch/use-nft-token-info";
import type { NftMintResult } from "@/lib/nft-launch/types";

type NftMintResultCardProps = {
  result: NftMintResult | null;
};

function truncateValue(value: string, head = 10, tail = 8) {
  if (value.length <= head + tail + 3) {
    return value;
  }

  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function addressesMatch(a?: string | null, b?: string | null) {
  if (!a || !b) {
    return false;
  }

  return a.toLowerCase() === b.toLowerCase();
}

export function NftMintResultCard({ result }: NftMintResultCardProps) {
  const tokenInfo = useNftTokenInfo({
    tokenId: result?.tokenId ?? null,
    owner: result?.receiver ?? null,
    enabled:
      result?.tokenId !== undefined &&
      result?.tokenId !== null &&
      Boolean(result.receiver),
  });

  if (!result) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
        Mint result and onchain verification will appear here after the
        transaction succeeds.
      </div>
    );
  }

  const verifiedOwner = addressesMatch(tokenInfo.ownerOf, result.receiver);
  const verifiedURI = Boolean(tokenInfo.tokenURI);
  const receiverHasNft = (tokenInfo.balanceOf ?? BigInt(0)) > BigInt(0);

  return (
    <div className="mt-4 grid gap-4">
      <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
        <h3 className="text-sm font-semibold text-emerald-100">
          Transaction Result
        </h3>

        <div className="mt-3 grid gap-3">
          <ResultRow
            label="Transaction Hash"
            value={truncateValue(result.txHash)}
            title={result.txHash}
          />
          <ResultRow
            label="Decoded Token ID"
            value={result.tokenId?.toString() ?? "-"}
          />
          <ResultRow
            label="Mint Token URI"
            value={result.tokenURI ?? "-"}
            breakAll
          />
          <ResultRow
            label="Image URI"
            value={result.imageURI ?? "-"}
            breakAll
          />
          <ResultRow
            label="Metadata URI"
            value={result.metadataURI ?? result.tokenURI ?? "-"}
            breakAll
          />
          <ResultRow
            label="Receiver"
            value={truncateValue(result.receiver)}
            title={result.receiver}
          />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-gray-950 p-3">
        <h3 className="text-sm font-semibold text-white">
          Onchain Verification
        </h3>

        {tokenInfo.isLoading ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-gray-900 p-3 text-sm text-gray-400">
            Reading onchain data...
          </div>
        ) : null}

        {tokenInfo.isError ? (
          <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            <div>Failed to verify onchain NFT data.</div>
            <div className="mt-1 break-all text-xs text-red-200/80">
              {tokenInfo.error instanceof Error
                ? tokenInfo.error.message
                : "Unknown verification error."}
            </div>
          </div>
        ) : null}

        {!tokenInfo.isLoading && !tokenInfo.isError ? (
          <div className="mt-3 grid gap-3">
            <ResultRow
              label="ownerOf(tokenId)"
              value={
                tokenInfo.ownerOf
                  ? truncateValue(tokenInfo.ownerOf)
                  : "Not verified"
              }
              title={tokenInfo.ownerOf ?? undefined}
            />
            <ResultRow
              label="tokenURI(tokenId)"
              value={tokenInfo.tokenURI ?? "Not verified"}
              breakAll
            />
            <ResultRow
              label="balanceOf(receiver)"
              value={tokenInfo.balanceOf?.toString() ?? "Not verified"}
            />

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                active={verifiedOwner}
                label={verifiedOwner ? "Verified Owner" : "Owner Pending"}
              />
              <StatusBadge
                active={verifiedURI}
                label={verifiedURI ? "Verified URI" : "URI Pending"}
              />
              <StatusBadge
                active={receiverHasNft}
                label={
                  receiverHasNft ? "Receiver Has NFT" : "Receiver Balance Empty"
                }
              />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ResultRow({
  label,
  value,
  title,
  breakAll = false,
}: {
  label: string;
  value: string;
  title?: string;
  breakAll?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900 p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div
        className={`text-sm text-white ${breakAll ? "break-all" : ""}`}
        title={title}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
          : "border-white/10 bg-gray-900 text-gray-400"
      }`}
    >
      {label}
    </div>
  );
}
