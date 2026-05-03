"use client";

import { useState } from "react";

import { nftCollectionAddress } from "@/lib/contracts/nft-contracts";
import type { CreateNftCollectionResult } from "@/lib/token-launch/types";
import { NftCollectionCard } from "./nft-collection-card";
import { NftEventHistory } from "./nft-event-history";
import { NftCollectionForm } from "./nft-collection-form";
import { NftMintPanel } from "./nft-mint-panel";

export function NftLaunchSection() {
  const [createdCollection, setCreatedCollection] =
    useState<CreateNftCollectionResult | null>(null);

  const activeCollectionAddress =
    createdCollection?.collectionAddress ?? nftCollectionAddress;
  const activeMintPrice = createdCollection?.mintPrice ?? BigInt(0);

  return (
    <section className="mt-6 grid gap-6">
      <NftCollectionForm onCreated={setCreatedCollection} />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <NftCollectionCard collectionAddress={activeCollectionAddress} />

        <NftMintPanel
          collectionAddress={activeCollectionAddress}
          mintPrice={activeMintPrice}
        />
      </div>

      <NftEventHistory selectedCollectionAddress={activeCollectionAddress} />
    </section>
  );
}
