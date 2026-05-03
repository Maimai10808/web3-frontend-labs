"use client";

import type { NftMetadata } from "@/lib/nft-launch/types";

type NftMetadataPreviewProps = {
  metadata: NftMetadata | null;
  imageURI?: string | null;
  metadataURI?: string | null;
};

export function NftMetadataPreview({
  metadata,
  imageURI,
  metadataURI,
}: NftMetadataPreviewProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h3 className="mb-3 text-base font-semibold text-white">
        NFT Metadata Preview
      </h3>

      {metadata ? (
        <div className="grid gap-3">
          {metadata.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={metadata.image}
              alt={metadata.name}
              className="aspect-square max-h-56 rounded-xl border border-white/10 object-cover"
            />
          ) : null}

          <PreviewRow label="Name" value={metadata.name} />
          <PreviewRow label="Description" value={metadata.description} />
          <PreviewRow label="Image URI" value={imageURI ?? metadata.image} />
          <PreviewRow label="Metadata URI" value={metadataURI ?? "-"} />

          {metadata.attributes?.length ? (
            <div className="rounded-xl border border-white/10 bg-gray-950 p-3">
              <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                Attributes
              </div>
              <div className="grid gap-2">
                {metadata.attributes.map((attribute) => (
                  <div
                    key={`${attribute.trait_type}-${attribute.value}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-400">
                      {attribute.trait_type}
                    </span>
                    <span className="text-white">{attribute.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-gray-950 p-4 text-xs text-gray-200">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          NFT metadata preview will appear after image upload and metadata
          build.
        </div>
      )}
    </section>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gray-950 p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="break-all text-sm text-white">{value}</div>
    </div>
  );
}
