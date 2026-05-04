"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { formatEther } from "viem";

import { useCreateNftCollection } from "@/hooks/nft-launch/use-create-nft-collection";
import { buildCollectionMetadata } from "@/lib/nft-launch/build-collection-metadata";
import { DEFAULT_BASE_TOKEN_URI } from "@/lib/nft-launch/build-create-collection-args";
import { nftCollectionFormSchema } from "@/lib/nft-launch/schema";
import type {
  CreateNftCollectionResult,
  NftCollectionCreateStep,
  NftCollectionFormValues,
  NftCollectionMetadata,
} from "@/lib/nft-launch/types";

type NftCollectionFormProps = {
  onCreated?: (result: CreateNftCollectionResult) => void;
};

const initialValues: NftCollectionFormValues = {
  name: "",
  symbol: "",
  description: "",
  externalUrl: "",
  maxSupply: "1000",
  mintPrice: "0",
  collectionImageFile: null,
};

const randomCollections = [
  {
    name: "MaiMai Genesis",
    symbol: "MAI",
    description: "A playful genesis collection for token launch experiments.",
    externalUrl: "https://example.com/maimai-genesis",
    maxSupply: "888",
    mintPrice: "0.001",
  },
  {
    name: "Crazy Meme Labs",
    symbol: "CML",
    description: "Experimental meme collectibles minted from the demo factory.",
    externalUrl: "https://example.com/crazy-meme-labs",
    maxSupply: "2026",
    mintPrice: "0",
  },
  {
    name: "Launch Pass",
    symbol: "PASS",
    description: "A compact collection for testing ERC721 launch flows.",
    externalUrl: "https://example.com/launch-pass",
    maxSupply: "500",
    mintPrice: "0.005",
  },
];

function createRandomCoverFile(collectionName: string) {
  const hue = Math.floor(Math.random() * 360);
  const accent = (hue + 120) % 360;
  const safeTitle = collectionName.replace(/[<>&]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 76% 48%)"/>
      <stop offset="100%" stop-color="hsl(${accent} 72% 42%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="#050816"/>
  <rect x="72" y="72" width="1056" height="1056" rx="72" fill="url(#bg)" opacity="0.88"/>
  <circle cx="930" cy="260" r="150" fill="white" opacity="0.16"/>
  <circle cx="270" cy="900" r="190" fill="black" opacity="0.18"/>
  <text x="120" y="620" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="700">${safeTitle}</text>
  <text x="124" y="700" fill="white" opacity="0.78" font-family="Arial, Helvetica, sans-serif" font-size="34">token-launch-demo collection</text>
</svg>`;

  return new File([svg], `${collectionName.toLowerCase().replace(/\s+/g, "-")}.svg`, {
    type: "image/svg+xml",
  });
}

function getStepLabel(step: NftCollectionCreateStep) {
  if (step === "image_uploading") {
    return "Uploading collection image...";
  }

  if (step === "metadata_building") {
    return "Building collection metadata...";
  }

  if (step === "metadata_uploading") {
    return "Uploading collection metadata...";
  }

  if (step === "wallet_confirming") {
    return "Confirm collection creation in wallet...";
  }

  if (step === "tx_confirming") {
    return "Waiting for collection transaction confirmation...";
  }

  if (step === "success") {
    return "Collection created successfully.";
  }

  if (step === "error") {
    return "Collection creation failed.";
  }

  return "Ready to create collection.";
}

export function NftCollectionForm({ onCreated }: NftCollectionFormProps) {
  const [values, setValues] = useState<NftCollectionFormValues>(initialValues);
  const [formError, setFormError] = useState<string | null>(null);
  const createCollection = useCreateNftCollection();

  const imagePreviewUrl = useMemo(() => {
    if (!values.collectionImageFile) {
      return null;
    }

    return URL.createObjectURL(values.collectionImageFile);
  }, [values.collectionImageFile]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const metadataPreview = useMemo<NftCollectionMetadata | null>(() => {
    if (!values.name || !values.description || !imagePreviewUrl) {
      return null;
    }

    return buildCollectionMetadata({
      name: values.name,
      description: values.description,
      externalUrl: values.externalUrl,
      image: imagePreviewUrl,
    });
  }, [imagePreviewUrl, values.description, values.externalUrl, values.name]);

  const setFieldValue = (
    key: keyof Omit<NftCollectionFormValues, "collectionImageFile">,
    value: string,
  ) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleImageChange = (file: File | null) => {
    setValues((previous) => ({
      ...previous,
      collectionImageFile: file,
    }));
  };

  const handleRandomFill = () => {
    const preset =
      randomCollections[Math.floor(Math.random() * randomCollections.length)] ??
      randomCollections[0];

    setValues({
      ...preset,
      collectionImageFile: createRandomCoverFile(preset.name),
    });
    setFormError(null);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = nftCollectionFormSchema.safeParse(values);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid collection form values.";
      setFormError(message);
      return;
    }

    try {
      const result = await createCollection.createCollection(parsed.data);
      onCreated?.(result);
    } catch {
      // The hook exposes the error below.
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Create NFT Collection
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Create a collection from business fields. The app uploads collection
            metadata to IPFS and sends the generated URI on-chain.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRandomFill}
          disabled={createCollection.isPending}
          className="w-fit rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-100 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate Random
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Name" error={formError?.includes("name") ? formError : undefined}>
              <input
                value={values.name}
                onChange={(event) => setFieldValue("name", event.target.value)}
                placeholder="MaiMai Genesis"
                className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
            </FormField>

            <FormField label="Symbol">
              <input
                value={values.symbol}
                onChange={(event) =>
                  setFieldValue("symbol", event.target.value)
                }
                placeholder="MAI"
                className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
            </FormField>

            <FormField label="Max Supply">
              <input
                value={values.maxSupply}
                onChange={(event) =>
                  setFieldValue("maxSupply", event.target.value)
                }
                placeholder="1000"
                className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
            </FormField>

            <FormField label="Mint Price (ETH)">
              <input
                value={values.mintPrice}
                onChange={(event) =>
                  setFieldValue("mintPrice", event.target.value)
                }
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              value={values.description}
              onChange={(event) =>
                setFieldValue("description", event.target.value)
              }
              rows={4}
              placeholder="Describe the collection."
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
            />
          </FormField>

          <FormField label="External URL" optional>
            <input
              value={values.externalUrl}
              onChange={(event) =>
                setFieldValue("externalUrl", event.target.value)
              }
              placeholder="https://example.com/collection"
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
            />
          </FormField>

          <FormField label="Collection Cover Image">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                handleImageChange(event.target.files?.[0] ?? null);
              }}
              className="block w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Required. This image is uploaded first and written into the
              collection metadata JSON.
            </p>
          </FormField>

          <div className="rounded-xl border border-white/10 bg-gray-950 p-3">
            <div className="text-sm font-medium text-white">
              Auto-generated URI plan
            </div>
            <div className="mt-2 grid gap-2 text-xs text-gray-400">
              <p>
                contractURI: generated by uploading collection metadata JSON to
                IPFS.
              </p>
              <p>baseTokenURI: {DEFAULT_BASE_TOKEN_URI}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={createCollection.isPending}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createCollection.isPending
              ? getStepLabel(createCollection.step)
              : "Create Collection"}
          </button>
        </form>

        <CollectionMetadataPreview
          metadata={metadataPreview}
          imagePreviewUrl={imagePreviewUrl}
          result={createCollection.result}
        />
      </div>

      {createCollection.step !== "idle" ? (
        <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-100">
          {getStepLabel(createCollection.step)}
        </div>
      ) : null}

      {formError || createCollection.error ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {formError ??
          (createCollection.error instanceof Error
            ? createCollection.error.message
            : "Failed to create NFT collection.")}
        </div>
      ) : null}

      <NftCollectionResult result={createCollection.result} />
    </section>
  );
}

function CollectionMetadataPreview({
  metadata,
  imagePreviewUrl,
  result,
}: {
  metadata: NftCollectionMetadata | null;
  imagePreviewUrl: string | null;
  result: CreateNftCollectionResult | null;
}) {
  const displayMetadata = result?.metadata ?? metadata;
  const displayImage = result?.imageGatewayUrl ?? imagePreviewUrl;

  return (
    <div className="rounded-2xl border border-white/10 bg-gray-950 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">Metadata Preview</h3>
        <p className="mt-1 text-xs text-gray-500">
          This JSON becomes the collection contractURI after IPFS upload.
        </p>
      </div>

      {displayImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayImage}
          alt={displayMetadata?.name ?? "Collection cover"}
          className="mb-3 aspect-square w-full rounded-xl border border-white/10 object-cover"
        />
      ) : (
        <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">
          Cover preview
        </div>
      )}

      {displayMetadata ? (
        <div className="grid gap-2 text-sm">
          <PreviewRow label="name" value={displayMetadata.name} />
          <PreviewRow label="description" value={displayMetadata.description} />
          <PreviewRow label="image" value={displayMetadata.image} />
          {displayMetadata.external_link ? (
            <PreviewRow
              label="external_link"
              value={displayMetadata.external_link}
            />
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Fill name, description and cover image to preview metadata.
        </p>
      )}
    </div>
  );
}

function NftCollectionResult({
  result,
}: {
  result: CreateNftCollectionResult | null;
}) {
  if (!result) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
        Created collection details will appear after the factory transaction
        succeeds.
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      <ResultRow label="Collection Address" value={result.collectionAddress} />
      <ResultRow label="Transaction Hash" value={result.txHash} />
      <ResultRow label="Creator" value={result.creator} />
      <ResultRow label="Name" value={result.name} />
      <ResultRow label="Symbol" value={result.symbol} />
      <ResultRow label="Contract URI" value={result.contractURI} />
      <ResultRow label="Base Token URI" value={result.baseTokenURI} />
      <ResultRow label="Max Supply" value={result.maxSupply.toString()} />
      <ResultRow
        label="Mint Price"
        value={`${formatEther(result.mintPrice)} ETH`}
      />
    </div>
  );
}

function FormField({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
        <span>{label}</span>
        {optional ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-normal text-gray-400">
            Optional
          </span>
        ) : null}
      </div>
      {children}
      {error ? <div className="mt-2 text-xs text-red-300">{error}</div> : null}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="break-all text-sm text-gray-100">{value}</div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gray-950 p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="break-all text-sm text-white">{value}</div>
    </div>
  );
}
