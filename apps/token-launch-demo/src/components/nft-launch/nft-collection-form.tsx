"use client";

import { useState, type FormEvent } from "react";
import { formatEther } from "viem";

import { useCreateNftCollection } from "@/hooks/nft-launch/use-create-nft-collection";
import { nftCollectionFormSchema } from "@/lib/token-launch/schema";
import type {
  CreateNftCollectionResult,
  NftCollectionFormValues,
} from "@/lib/token-launch/types";

type NftCollectionFormProps = {
  onCreated?: (result: CreateNftCollectionResult) => void;
};

const initialValues: NftCollectionFormValues = {
  name: "",
  symbol: "",
  contractURI: "",
  baseTokenURI: "",
  maxSupply: "1000",
  mintPrice: "0",
};

export function NftCollectionForm({ onCreated }: NftCollectionFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const createCollection = useCreateNftCollection();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const values = {
      name: String(formData.get("name") ?? ""),
      symbol: String(formData.get("symbol") ?? ""),
      contractURI: String(formData.get("contractURI") ?? ""),
      baseTokenURI: String(formData.get("baseTokenURI") ?? ""),
      maxSupply: String(formData.get("maxSupply") ?? ""),
      mintPrice: String(formData.get("mintPrice") ?? ""),
    };

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
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Create NFT Collection
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Deploy a new LaunchERC721Collection through the collection factory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Name" name="name" defaultValue={initialValues.name} />
          <FormField
            label="Symbol"
            name="symbol"
            defaultValue={initialValues.symbol}
          />
          <FormField
            label="Contract URI"
            name="contractURI"
            defaultValue={initialValues.contractURI}
            placeholder="ipfs://collection.json"
          />
          <FormField
            label="Base Token URI"
            name="baseTokenURI"
            defaultValue={initialValues.baseTokenURI}
            placeholder="ipfs://metadata-folder/"
          />
          <FormField
            label="Max Supply"
            name="maxSupply"
            defaultValue={initialValues.maxSupply}
          />
          <FormField
            label="Mint Price (ETH)"
            name="mintPrice"
            defaultValue={initialValues.mintPrice}
          />
        </div>

        <button
          type="submit"
          disabled={createCollection.isPending}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createCollection.isPending
            ? "Creating collection..."
            : "Create Collection"}
        </button>
      </form>

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
      <ResultRow label="Mint Price" value={`${formatEther(result.mintPrice)} ETH`} />
    </div>
  );
}

function FormField({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: keyof NftCollectionFormValues;
  defaultValue: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-gray-200">{label}</div>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
      />
    </label>
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
