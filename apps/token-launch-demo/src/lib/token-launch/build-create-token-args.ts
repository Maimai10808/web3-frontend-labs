import { parseUnits } from "viem";
import type { ValidatedTokenLaunchFormValues } from "./types";

export type BuildCreateTokenArgsInput = {
  form: Pick<
    ValidatedTokenLaunchFormValues,
    "tokenName" | "tokenSymbol" | "description"
  >;
  metadataUrl: string;
  maxSupply: string;
  decimals?: number;
};

export type CreateTokenArgs = {
  name: string;
  symbol: string;
  maxSupply: bigint;
  metadataURI: string;
};

export function buildCreateTokenArgs({
  form,
  metadataUrl,
  maxSupply,
  decimals = 18,
}: BuildCreateTokenArgsInput): CreateTokenArgs {
  const normalizedMaxSupply = maxSupply.trim();

  if (!normalizedMaxSupply) {
    throw new Error("Max supply is required.");
  }

  return {
    name: form.tokenName.trim(),
    symbol: form.tokenSymbol.trim(),
    maxSupply: parseUnits(normalizedMaxSupply, decimals),
    metadataURI: metadataUrl,
  };
}
