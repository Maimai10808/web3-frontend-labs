import type { Address } from "viem";

export type NftMintInput = {
  receiver: Address;
  customTokenURI?: string;
};

export type NftMintResult = {
  txHash: `0x${string}`;
  tokenId?: bigint;
  receiver: Address;
  tokenURI?: string;
};

export type NftCollectionInfo = {
  name: string;
  symbol: string;
  contractURI: string;
  baseTokenURI: string;
  maxSupply: bigint;
  nextTokenId: bigint;
  totalSupply: bigint;
  totalMinted: bigint;
};
