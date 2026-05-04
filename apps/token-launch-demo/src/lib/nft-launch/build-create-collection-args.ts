import { parseEther } from "viem";
import type { ValidatedNftCollectionFormValues } from "./types";

export const DEFAULT_BASE_TOKEN_URI = "ipfs://token-launch-demo-placeholder/";

export type CreateNftCollectionArgs = {
  name: string;
  symbol: string;
  contractURI: string;
  baseTokenURI: string;
  maxSupply: bigint;
  mintPrice: bigint;
};

export function buildCreateCollectionArgs({
  values,
  contractURI,
  baseTokenURI = DEFAULT_BASE_TOKEN_URI,
}: {
  values: ValidatedNftCollectionFormValues;
  contractURI: string;
  baseTokenURI?: string;
}): CreateNftCollectionArgs {
  return {
    name: values.name.trim(),
    symbol: values.symbol.trim(),
    contractURI,
    baseTokenURI,
    maxSupply: BigInt(values.maxSupply),
    mintPrice: parseEther(values.mintPrice),
  };
}
