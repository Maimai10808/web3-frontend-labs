"use client";

import type { TokenMetadataJson } from "@/lib/token-launch/types";

type TokenMetadataPreviewProps = {
  metadata: TokenMetadataJson | null;
};

export function TokenMetadataPreview({ metadata }: TokenMetadataPreviewProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h3 className="mb-3 text-base font-semibold text-white">
        Token Metadata Preview
      </h3>

      {metadata ? (
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-gray-950 p-4 text-xs text-gray-200">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          Metadata preview will appear here after logo upload and metadata
          build.
        </div>
      )}
    </section>
  );
}
