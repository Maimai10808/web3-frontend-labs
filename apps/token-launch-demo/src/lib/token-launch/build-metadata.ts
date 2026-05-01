import { tokenMetadataSchema } from "./schema";
import type { TokenMetadataInput, TokenMetadataJson } from "./types";

function omitEmptyFields(
  input: Record<string, string | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      return typeof value === "string" && value.trim().length > 0;
    }),
  ) as Record<string, string>;
}

export function buildTokenMetadata(
  input: TokenMetadataInput,
  imageUrl: string,
): TokenMetadataJson {
  const metadata = {
    name: input.name.trim(),
    symbol: input.symbol.trim(),
    description: input.description.trim(),
    image: imageUrl,
    createdOn: "token-launch-demo",
    ...omitEmptyFields({
      website: input.website,
      twitter: input.twitter,
      telegram: input.telegram,
    }),
  };

  return tokenMetadataSchema.parse(metadata);
}
