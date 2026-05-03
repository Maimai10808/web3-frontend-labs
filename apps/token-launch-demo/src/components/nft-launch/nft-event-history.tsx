"use client";

import { formatEther, type Address } from "viem";

import { useNftCollectionCreatedEvents } from "@/hooks/nft-launch/use-nft-collection-created-events";
import { useNftMintedEvents } from "@/hooks/nft-launch/use-nft-minted-events";

type NftEventHistoryProps = {
  selectedCollectionAddress?: Address | null;
};

function shorten(value: string, head = 6, tail = 4) {
  if (value.length <= head + tail + 3) {
    return value;
  }

  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function NftEventHistory({
  selectedCollectionAddress,
}: NftEventHistoryProps) {
  const collectionCreated = useNftCollectionCreatedEvents();
  const minted = useNftMintedEvents(selectedCollectionAddress);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <HistoryCard
        title="Collection Created History"
        isLoading={collectionCreated.isLoading}
        error={collectionCreated.error}
        empty={collectionCreated.events.length === 0}
        emptyMessage="No factory collection creation events found."
      >
        {collectionCreated.events.map((event) => (
          <div
            key={`${event.txHash}-${event.collection}`}
            className="rounded-xl border border-white/10 bg-gray-950 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">
                {event.name} ({event.symbol})
              </div>
              <div className="text-xs text-gray-500">
                Block {event.blockNumber.toString()}
              </div>
            </div>

            <RecordRow label="Collection" value={shorten(event.collection)} />
            <RecordRow label="Creator" value={shorten(event.creator)} />
            <RecordRow label="Contract URI" value={event.contractURI} breakAll />
            <RecordRow label="Base Token URI" value={event.baseTokenURI} breakAll />
            <RecordRow label="Max Supply" value={event.maxSupply.toString()} />
            <RecordRow
              label="Mint Price"
              value={`${formatEther(event.mintPrice)} ETH`}
            />
            <RecordRow label="Tx" value={shorten(event.txHash)} />
          </div>
        ))}
      </HistoryCard>

      <HistoryCard
        title="Mint History"
        isLoading={minted.isLoading}
        error={minted.error}
        empty={minted.events.length === 0}
        emptyMessage={
          selectedCollectionAddress
            ? "No mint events found for the selected collection."
            : "Select or create a collection to read mint history."
        }
      >
        {minted.events.map((event) => (
          <div
            key={`${event.txHash}-${event.tokenId.toString()}`}
            className="rounded-xl border border-white/10 bg-gray-950 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">
                Token #{event.tokenId.toString()}
              </div>
              <div className="text-xs text-gray-500">
                Block {event.blockNumber.toString()}
              </div>
            </div>

            <RecordRow label="Operator" value={shorten(event.operator)} />
            <RecordRow label="To" value={shorten(event.to)} />
            <RecordRow label="Paid" value={`${formatEther(event.paid)} ETH`} />
            <RecordRow label="Tx" value={shorten(event.txHash)} />
          </div>
        ))}
      </HistoryCard>
    </section>
  );
}

function HistoryCard({
  title,
  isLoading,
  error,
  empty,
  emptyMessage,
  children,
}: {
  title: string;
  isLoading: boolean;
  error: Error | null;
  empty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h3 className="mb-3 text-base font-semibold text-white">{title}</h3>

      {isLoading ? (
        <div className="rounded-xl border border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          Loading onchain events...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {error.message}
        </div>
      ) : null}

      {!isLoading && !error && empty ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          {emptyMessage}
        </div>
      ) : null}

      {!isLoading && !error && !empty ? (
        <div className="grid gap-3">{children}</div>
      ) : null}
    </section>
  );
}

function RecordRow({
  label,
  value,
  breakAll = false,
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="mt-1 grid gap-1 text-xs md:grid-cols-[110px_1fr]">
      <div className="uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-gray-200 ${breakAll ? "break-all" : ""}`}>
        {value}
      </div>
    </div>
  );
}
