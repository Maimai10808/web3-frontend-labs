import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { Address } from "viem";
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

type UseNftMintPanelParams = {
  collectionAddress: Address;
  mintPrice: bigint;
};

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

export function useNftMintPanel({
  collectionAddress,
  mintPrice,
}: UseNftMintPanelParams) {
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
          collectionAddress,
          receiver: account.address ?? values.receiver,
          mintPrice,
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
        collectionAddress,
        receiver: account.address ?? values.receiver,
        mintPrice,
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

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
  };

  const buttonLabel = !account.isConnected
    ? "Connect Wallet"
    : isUploadingNftImage
      ? "Uploading image..."
      : isUploadingNftMetadata
        ? "Uploading metadata..."
        : mintNft.isPending
          ? "Minting..."
          : "Mint NFT";

  const isSubmitDisabled =
    !account.isConnected ||
    !form.formState.isValid ||
    isBusy ||
    (!advancedTokenURI && !imageFile);

  return {
    buttonLabel,
    combinedError,
    form,
    handleImageFileChange,
    handleSubmit: form.handleSubmit(onSubmit),
    imageFile,
    isSubmitDisabled,
    metadataPreview,
    mintResult,
    previewImageURI: uploadedNftImage?.imageURI ?? mintResult?.imageURI ?? null,
    previewMetadata: uploadedNftMetadata?.metadata ?? metadataPreview,
    previewMetadataURI:
      uploadedNftMetadata?.metadataURI ?? mintResult?.metadataURI ?? null,
  };
}
