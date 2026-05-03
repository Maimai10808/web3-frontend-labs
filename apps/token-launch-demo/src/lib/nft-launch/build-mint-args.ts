import type { Address } from "viem";
import type { NftMintInput } from "./types";

export function buildMintArgs(input: NftMintInput) {
  const receiver = input.receiver as Address;
  const customTokenURI = input.customTokenURI?.trim();

  if (customTokenURI) {
    return {
      functionName: "adminMintToWithURI",
      args: [receiver, customTokenURI] as const,
    } as const;
  }

  return {
    functionName: "adminMintTo",
    args: [receiver] as const,
  } as const;
}
