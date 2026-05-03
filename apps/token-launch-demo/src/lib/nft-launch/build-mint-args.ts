import type { Address } from "viem";
import type { NftMintFormInput } from "./schema";

export function buildMintArgs(input: NftMintFormInput) {
  const receiver = input.receiver as Address;
  const customTokenURI = input.customTokenURI?.trim();

  if (customTokenURI) {
    return {
      functionName: "mintToWithURI",
      args: [receiver, customTokenURI] as const,
    } as const;
  }

  return {
    functionName: "mintTo",
    args: [receiver] as const,
  } as const;
}
