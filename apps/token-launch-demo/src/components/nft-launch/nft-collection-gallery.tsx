"use client";

import { useState } from "react";
import { formatEther, type Address } from "viem";
import type { NftCollectionCard } from "@/lib/nft-launch/types";

type NftCollectionGalleryProps = {
  collections: NftCollectionCard[];
  selectedCollectionAddress?: Address | null;
  onSelectCollection: (address: Address) => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
};

function shorten(value: string, head = 6, tail = 4) {
  if (value.length <= head + tail + 3) {
    return value;
  }

  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function NftCollectionGallery({
  collections,
  selectedCollectionAddress,
  onSelectCollection,
  isLoading = false,
  isError = false,
  error,
  onRefresh,
}: NftCollectionGalleryProps) {
  const [pendingCollectionAddress, setPendingCollectionAddress] =
    useState<Address | null>(null);
  const effectivePendingAddress =
    pendingCollectionAddress ?? selectedCollectionAddress ?? null;

  const confirmSelection = () => {
    if (!effectivePendingAddress) {
      return;
    }

    onSelectCollection(effectivePendingAddress);
    setPendingCollectionAddress(null);
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Your NFT Collections
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Select a factory-created collection to inspect, mint, and view mint
            history.
          </p>
        </div>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="w-fit rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 transition hover:bg-white/10"
          >
            Refresh
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-white/10 bg-gray-950"
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {error?.message ?? "Failed to load NFT collections."}
        </div>
      ) : null}

      {!isLoading && !isError && collections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          No collections found for this wallet. Create one above to start
          minting.
        </div>
      ) : null}

      {!isLoading && !isError && collections.length > 0 ? (
        <>
          <div className="space-y-3">
            {collections.map((collection) => {
              const selected =
                selectedCollectionAddress?.toLowerCase() ===
                collection.address.toLowerCase();
              const pending =
                effectivePendingAddress?.toLowerCase() ===
                collection.address.toLowerCase();
              const showPreview = pending && !selected;

              return (
                <article
                  key={collection.address}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPendingCollectionAddress(collection.address)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setPendingCollectionAddress(collection.address);
                    }
                  }}
                  className={`cursor-pointer rounded-2xl border bg-gray-950 p-3 outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    pending
                      ? "border-blue-400/70 bg-blue-500/10 shadow-lg shadow-blue-950/30"
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    {collection.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="h-24 w-full rounded-xl border border-white/10 object-cover md:h-24 md:w-24"
                      />
                    ) : (
                      <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-600/30 via-emerald-500/20 to-gray-950 text-sm text-gray-300 md:w-24">
                        Collection Cover
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold text-white">
                            {collection.name}
                          </h3>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-300">
                            {collection.symbol}
                          </span>
                        </div>
                        <p className="mt-1 break-all text-xs text-gray-500">
                          {collection.address}
                        </p>
                      </div>

                      <div className="grid gap-2 text-xs md:grid-cols-3">
                        <CardRow
                          label="Supply"
                          value={`${collection.totalMinted.toString()} / ${collection.maxSupply.toString()}`}
                        />
                        <CardRow
                          label="Mint Price"
                          value={`${formatEther(collection.mintPrice)} ETH`}
                        />
                        {collection.blockNumber ? (
                          <CardRow
                            label="Created"
                            value={`Block ${collection.blockNumber.toString()}`}
                          />
                        ) : (
                          <CardRow label="Created" value="On-chain" />
                        )}
                      </div>

                      <div className="grid gap-2 text-xs md:grid-cols-2">
                        {collection.creator ? (
                          <CardRow
                            label="Creator"
                            value={shorten(collection.creator)}
                          />
                        ) : null}
                        <CardRow
                          label="Contract URI"
                          value={collection.contractURI}
                          breakAll
                        />
                      </div>
                    </div>

                    <div className="flex min-h-7 w-24 shrink-0 flex-row justify-end gap-2 md:flex-col md:items-end">
                      {selected ? (
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-100">
                          Selected
                        </span>
                      ) : null}
                      {showPreview ? (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-100">
                          Preview
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <button
              type="button"
              disabled={!effectivePendingAddress}
              onClick={confirmSelection}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {effectivePendingAddress
                ? "Use Selected Collection"
                : "Select a Collection"}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

function CardRow({
  label,
  value,
  breakAll = false,
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="grid gap-1 rounded-lg bg-white/[0.03] px-3 py-2">
      <div className="uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-gray-200 ${breakAll ? "break-all" : ""}`}>
        {value}
      </div>
    </div>
  );
}
