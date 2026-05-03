import type { NftMintInput } from "./types";

export function buildMintArgs(input: NftMintInput) {
  const customTokenURI = input.customTokenURI?.trim();

  if (customTokenURI) {
    return {
      functionName: "mintWithURI",
      args: [customTokenURI] as const,
      value: input.mintPrice,
    } as const;
  }

  return {
    functionName: "mint",
    args: [] as const,
    value: input.mintPrice,
  } as const;
}
