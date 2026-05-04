import type {
  NftCollectionMetadata,
  NftCollectionMetadataInput,
} from "./types";

export function buildCollectionMetadata(
  input: NftCollectionMetadataInput,
): NftCollectionMetadata {
  const metadata: NftCollectionMetadata = {
    name: input.name.trim(),
    description: input.description.trim(),
    image: input.image,
  };

  if (input.externalUrl?.trim()) {
    metadata.external_link = input.externalUrl.trim();
  }

  return metadata;
}
