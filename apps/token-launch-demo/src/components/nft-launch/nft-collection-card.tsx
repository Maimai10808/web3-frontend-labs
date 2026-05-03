"use client";

import { nftCollectionAddress } from "@/lib/contracts/nft-contracts";
import { useNftCollectionInfo } from "@/hooks/nft-launch/use-nft-collection-info";

export function NftCollectionCard() {
  const collectionQuery = useNftCollectionInfo();
  const collection = collectionQuery.data;

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">NFT Collection</h2>
        <p className="mt-1 text-sm text-gray-400">
          Read collection metadata and supply state from the deployed ERC721
          contract.
        </p>
      </div>

      {collectionQuery.isLoading ? (
        <div className="rounded-xl border border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          Loading collection...
        </div>
      ) : collectionQuery.isError ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {collectionQuery.error instanceof Error
            ? collectionQuery.error.message
            : "Failed to load NFT collection."}
        </div>
      ) : collection ? (
        <div className="grid gap-3 md:grid-cols-2">
          <InfoItem label="Name" value={collection.name} />
          <InfoItem label="Symbol" value={collection.symbol} />
          <InfoItem
            label="Address"
            value={nftCollectionAddress}
            breakAll
          />
          <InfoItem
            label="Contract URI"
            value={collection.contractURI}
            breakAll
          />
          <InfoItem
            label="Base Token URI"
            value={collection.baseTokenURI}
            breakAll
          />
          <InfoItem
            label="Max Supply"
            value={collection.maxSupply.toString()}
          />
          <InfoItem
            label="Total Supply"
            value={collection.totalSupply.toString()}
          />
          <InfoItem
            label="Total Minted"
            value={collection.totalMinted.toString()}
          />
          <InfoItem
            label="Next Token ID"
            value={collection.nextTokenId.toString()}
          />
        </div>
      ) : null}
    </section>
  );
}

function InfoItem(props: { label: string; value: string; breakAll?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gray-950 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {props.label}
      </div>
      <div
        className={`mt-1 text-sm font-semibold text-white ${
          props.breakAll ? "break-all" : ""
        }`}
      >
        {props.value}
      </div>
    </div>
  );
}
