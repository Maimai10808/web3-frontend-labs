import { parseEther } from "viem";
import type { ValidatedNftCollectionFormValues } from "./types";

export type CreateNftCollectionArgs = {
  name: string;
  symbol: string;
  contractURI: string;
  baseTokenURI: string;
  maxSupply: bigint;
  mintPrice: bigint;
};

export function buildCreateNftCollectionArgs(
  values: ValidatedNftCollectionFormValues,
): CreateNftCollectionArgs {
  return {
    name: values.name.trim(),
    symbol: values.symbol.trim(),
    contractURI: values.contractURI.trim(),
    baseTokenURI: values.baseTokenURI.trim(),
    maxSupply: BigInt(values.maxSupply),
    mintPrice: parseEther(values.mintPrice),
  };
}
