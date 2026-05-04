"use client";

import type { Address } from "viem";

import { useNftMintPanel } from "@/hooks/nft-launch/use-nft-mint-panel";
import { NftMetadataPreview } from "./nft-metadata-preview";
import { NftMintResultCard } from "./nft-mint-result-card";

type NftMintPanelProps = {
  collectionAddress?: Address | null;
  mintPrice: bigint;
  onMinted?: () => void;
};

export function NftMintPanel({
  collectionAddress,
  mintPrice,
  onMinted,
}: NftMintPanelProps) {
  const {
    buttonLabel,
    combinedError,
    form,
    hasSelectedCollection,
    handleImageFileChange,
    handleSubmit,
    isSubmitDisabled,
    mintResult,
    previewImageURI,
    previewMetadata,
    previewMetadataURI,
  } = useNftMintPanel({ collectionAddress, mintPrice, onMinted });

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-gray-900 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Mint NFT</h2>
          <p className="mt-1 text-sm text-gray-400">
            {hasSelectedCollection
              ? `Minting to ${collectionAddress}`
              : "Select a collection before minting."}
          </p>
        </div>

        {!hasSelectedCollection ? (
          <div className="mb-4 rounded-xl border border-dashed border-white/10 bg-gray-950 p-3 text-sm text-gray-400">
            Select a collection from Your NFT Collections to enable minting.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="text-sm font-medium text-gray-200">
              Receiver
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              placeholder="0x..."
              {...form.register("receiver")}
            />
            {form.formState.errors.receiver ? (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.receiver.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-200">
              NFT Name
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              placeholder="MaiMai #1"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-200">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe this NFT."
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-200">
              NFT Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                handleImageFileChange(event.target.files?.[0] ?? null);
              }}
              className="mt-1 block w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Required for the default IPFS metadata mint flow.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-200">
              External URL
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              placeholder="https://example.com/nft/1"
              {...form.register("externalUrl")}
            />
            {form.formState.errors.externalUrl ? (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.externalUrl.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-200">
              Attributes
            </label>
            <textarea
              className="mt-1 w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              rows={3}
              placeholder={"Background: Blue\nPower: 42"}
              {...form.register("attributesText")}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional. Use one trait per line in Trait: Value format.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-200">
              Advanced Token URI Override
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              placeholder="ipfs://... or https://..."
              {...form.register("customTokenURI")}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional. If set, this bypasses image and metadata upload and
              mints directly with this tokenURI.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonLabel}
          </button>
        </form>

        {combinedError ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {combinedError}
          </div>
        ) : null}

        <NftMintResultCard result={mintResult} />
      </div>

      <NftMetadataPreview
        metadata={previewMetadata}
        imageURI={previewImageURI}
        metadataURI={previewMetadataURI}
      />
    </section>
  );
}
