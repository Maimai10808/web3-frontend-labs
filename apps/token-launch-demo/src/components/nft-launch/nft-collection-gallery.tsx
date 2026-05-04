"use client";

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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-2xl border border-white/10 bg-gray-950"
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => {
            const selected =
              selectedCollectionAddress?.toLowerCase() ===
              collection.address.toLowerCase();

            return (
              <article
                key={collection.address}
                className={`overflow-hidden rounded-2xl border bg-gray-950 transition ${
                  selected
                    ? "border-blue-400/70 shadow-lg shadow-blue-950/40"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {collection.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-blue-600/30 via-emerald-500/20 to-gray-950 text-sm text-gray-300">
                    Collection Cover
                  </div>
                )}

                <div className="grid gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-white">
                        {collection.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {collection.symbol}
                      </p>
                    </div>
                    {selected ? (
                      <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-100">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-2 text-xs">
                    <CardRow
                      label="Address"
                      value={shorten(collection.address)}
                    />
                    <CardRow
                      label="Supply"
                      value={`${collection.totalMinted.toString()} / ${collection.maxSupply.toString()}`}
                    />
                    <CardRow
                      label="Mint Price"
                      value={`${formatEther(collection.mintPrice)} ETH`}
                    />
                    {collection.creator ? (
                      <CardRow
                        label="Creator"
                        value={shorten(collection.creator)}
                      />
                    ) : null}
                    {collection.blockNumber ? (
                      <CardRow
                        label="Created"
                        value={`Block ${collection.blockNumber.toString()}`}
                      />
                    ) : null}
                    <CardRow
                      label="Contract URI"
                      value={collection.contractURI}
                      breakAll
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCollection(collection.address)}
                    disabled={selected}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition disabled:cursor-default ${
                      selected
                        ? "bg-blue-500/15 text-blue-100"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    {selected ? "Selected" : "Select Collection"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
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
