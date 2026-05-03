"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAccount } from "wagmi";

import { useMintNft } from "@/hooks/nft-launch/use-mint-nft";
import { useUploadNftImage } from "@/hooks/nft-launch/use-upload-nft-image";
import { useUploadNftMetadata } from "@/hooks/nft-launch/use-upload-nft-metadata";
import { buildNftMetadata } from "@/lib/nft-launch/build-nft-metadata";
import {
  nftMintSchema,
  type NftMintFormInput,
  type NftMintFormValues,
} from "@/lib/nft-launch/schema";
import type {
  NftAttribute,
  NftMetadata,
  NftMintResult,
} from "@/lib/nft-launch/types";
import { NftMetadataPreview } from "./nft-metadata-preview";
import { NftMintResultCard } from "./nft-mint-result-card";

function parseAttributes(attributesText?: string): NftAttribute[] {
  if (!attributesText?.trim()) {
    return [];
  }

  return attributesText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [traitType, ...valueParts] = line.split(":");
      const rawValue = valueParts.join(":").trim();
      const numericValue = Number(rawValue);

      return {
        trait_type: traitType.trim(),
        value:
          rawValue && Number.isFinite(numericValue) ? numericValue : rawValue,
      };
    })
    .filter((attribute) => {
      return (
        attribute.trait_type.length > 0 && String(attribute.value).length > 0
      );
    });
}

export function NftMintPanel() {
  const account = useAccount();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [metadataPreview, setMetadataPreview] = useState<NftMetadata | null>(
    null,
  );
  const [mintResult, setMintResult] = useState<NftMintResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const mintNft = useMintNft();
  const {
    uploadNftImage,
    uploadedNftImage,
    isUploadingNftImage,
    uploadNftImageError,
  } = useUploadNftImage();
  const {
    uploadNftMetadata,
    uploadedNftMetadata,
    isUploadingNftMetadata,
    uploadNftMetadataError,
  } = useUploadNftMetadata();

  const form = useForm<NftMintFormValues, unknown, NftMintFormInput>({
    resolver: zodResolver(nftMintSchema),
    defaultValues: {
      receiver: account.address ?? "",
      name: "",
      description: "",
      externalUrl: "",
      attributesText: "",
      customTokenURI: "",
    },
    mode: "onChange",
  });

  const customTokenURI = useWatch({
    control: form.control,
    name: "customTokenURI",
  });
  const advancedTokenURI = customTokenURI?.trim();
  const isBusy =
    mintNft.isPending || isUploadingNftImage || isUploadingNftMetadata;
  const combinedError = useMemo(() => {
    return (
      localError ??
      uploadNftImageError?.message ??
      uploadNftMetadataError?.message ??
      (mintNft.error instanceof Error ? mintNft.error.message : null)
    );
  }, [
    localError,
    uploadNftImageError,
    uploadNftMetadataError,
    mintNft.error,
  ]);

  useEffect(() => {
    if (!account.address || form.getValues("receiver")) {
      return;
    }

    form.setValue("receiver", account.address, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [account.address, form]);

  async function onSubmit(values: NftMintFormInput) {
    setLocalError(null);
    setMintResult(null);

    try {
      if (values.customTokenURI?.trim()) {
        const result = await mintNft.mutateAsync({
          receiver: values.receiver,
          customTokenURI: values.customTokenURI,
        });
        setMintResult(result);
        return;
      }

      if (!imageFile) {
        setLocalError("Select an NFT image before uploading metadata.");
        return;
      }

      const image = await uploadNftImage(imageFile);
      const metadata = buildNftMetadata({
        name: values.name ?? "",
        description: values.description ?? "",
        image: image.imageURI,
        externalUrl: values.externalUrl,
        attributes: parseAttributes(values.attributesText),
      });

      setMetadataPreview(metadata);

      const uploadedMetadata = await uploadNftMetadata(metadata);
      const result = await mintNft.mutateAsync({
        receiver: values.receiver,
        customTokenURI: uploadedMetadata.metadataURI,
      });

      setMintResult({
        ...result,
        imageURI: image.imageURI,
        metadataURI: uploadedMetadata.metadataURI,
        metadata,
      });
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "NFT mint failed.");
    }
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-gray-900 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Mint NFT</h2>
          <p className="mt-1 text-sm text-gray-400">
            Upload NFT image and metadata to IPFS, then mint with the metadata
            URI as the tokenURI.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
                setImageFile(event.target.files?.[0] ?? null);
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
            disabled={
              !account.isConnected ||
              !form.formState.isValid ||
              isBusy ||
              (!advancedTokenURI && !imageFile)
            }
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!account.isConnected
              ? "Connect Wallet"
              : isUploadingNftImage
                ? "Uploading image..."
                : isUploadingNftMetadata
                  ? "Uploading metadata..."
                  : mintNft.isPending
                    ? "Minting..."
                    : "Mint NFT"}
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
        metadata={uploadedNftMetadata?.metadata ?? metadataPreview}
        imageURI={uploadedNftImage?.imageURI ?? mintResult?.imageURI ?? null}
        metadataURI={
          uploadedNftMetadata?.metadataURI ?? mintResult?.metadataURI ?? null
        }
      />
    </section>
  );
}
