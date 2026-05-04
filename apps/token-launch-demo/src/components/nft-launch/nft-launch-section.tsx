"use client";

import { useMemo, useState } from "react";
import type { Address } from "viem";

import { useCreatorNftCollections } from "@/hooks/nft-launch/use-creator-nft-collections";
import { useNftCollectionCards } from "@/hooks/nft-launch/use-nft-collection-cards";
import { useNftCollectionCreatedEvents } from "@/hooks/nft-launch/use-nft-collection-created-events";
import type { CreateNftCollectionResult } from "@/lib/nft-launch/types";
import { NftCollectionCard } from "./nft-collection-card";
import { NftEventHistory } from "./nft-event-history";
import { NftCollectionForm } from "./nft-collection-form";
import { NftCollectionGallery } from "./nft-collection-gallery";
import { NftMintPanel } from "./nft-mint-panel";

export function NftLaunchSection() {
  const [createdCollection, setCreatedCollection] =
    useState<CreateNftCollectionResult | null>(null);
  const [manualSelectedCollectionAddress, setManualSelectedCollectionAddress] =
    useState<Address | null>(null);

  const creatorCollections = useCreatorNftCollections();
  const collectionCreatedEvents = useNftCollectionCreatedEvents();
  const collectionAddresses = useMemo(() => {
    const addresses = new Map<string, Address>();

    for (const address of creatorCollections.collectionAddresses) {
      addresses.set(address.toLowerCase(), address);
    }

    if (createdCollection?.collectionAddress) {
      addresses.set(
        createdCollection.collectionAddress.toLowerCase(),
        createdCollection.collectionAddress,
      );
    }

    return Array.from(addresses.values());
  }, [createdCollection, creatorCollections.collectionAddresses]);

  const selectedCollectionAddress =
    manualSelectedCollectionAddress &&
    collectionAddresses.some((address) => {
      return (
        address.toLowerCase() === manualSelectedCollectionAddress.toLowerCase()
      );
    })
      ? manualSelectedCollectionAddress
      : collectionAddresses[0] ?? null;

  const collectionCards = useNftCollectionCards({
    collectionAddresses,
    createdEvents: collectionCreatedEvents.events,
  });
  const selectedCollection = collectionCards.collections.find((collection) => {
    return (
      selectedCollectionAddress?.toLowerCase() ===
      collection.address.toLowerCase()
    );
  });
  const activeMintPrice = selectedCollection?.mintPrice ?? BigInt(0);

  const refreshCollections = async () => {
    await creatorCollections.refetch();
    await collectionCreatedEvents.refetch();
    await collectionCards.refetch();
  };

  const handleCreated = async (result: CreateNftCollectionResult) => {
    setCreatedCollection(result);
    setManualSelectedCollectionAddress(result.collectionAddress);
    await refreshCollections();
  };

  const handleMinted = () => {
    void collectionCards.refetch();
  };

  return (
    <section className="mt-6 grid gap-6">
      <NftCollectionForm
        onCreated={(result) => {
          void handleCreated(result);
        }}
        onCollectionCreated={setManualSelectedCollectionAddress}
      />

      <NftCollectionGallery
        collections={collectionCards.collections}
        selectedCollectionAddress={selectedCollectionAddress}
        onSelectCollection={setManualSelectedCollectionAddress}
        isLoading={creatorCollections.isLoading || collectionCards.isLoading}
        isError={creatorCollections.isError || collectionCards.isError}
        error={creatorCollections.error ?? collectionCards.error}
        onRefresh={() => {
          void refreshCollections();
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <NftCollectionCard collectionAddress={selectedCollectionAddress} />

        <NftMintPanel
          collectionAddress={selectedCollectionAddress}
          mintPrice={activeMintPrice}
          onMinted={handleMinted}
        />
      </div>

      <NftEventHistory selectedCollectionAddress={selectedCollectionAddress} />
    </section>
  );
}
