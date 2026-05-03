import { nftMetadataSchema } from "./schema";
import type { NftAttribute, NftMetadata, NftMetadataInput } from "./types";

function normalizeAttributes(attributes?: NftAttribute[]) {
  if (!attributes?.length) {
    return undefined;
  }

  return attributes;
}

export function buildNftMetadata(input: NftMetadataInput): NftMetadata {
  const metadata = {
    name: input.name.trim(),
    description: input.description.trim(),
    image: input.image,
    external_url: input.externalUrl?.trim(),
    attributes: normalizeAttributes(input.attributes),
  };

  return nftMetadataSchema.parse(metadata);
}
