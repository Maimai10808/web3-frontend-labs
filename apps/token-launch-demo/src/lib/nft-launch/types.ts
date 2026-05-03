import type { Address } from "viem";

export type NftAttribute = {
  trait_type: string;
  value: string | number;
};

export type NftMetadataInput = {
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
  attributes?: NftAttribute[];
};

export type NftMetadata = {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: NftAttribute[];
};

export type UploadedNftImageResult = {
  imageURI: string;
  imageHash?: string;
};

export type UploadedNftMetadataResult = {
  metadataURI: string;
  metadataHash?: string;
  metadata: NftMetadata;
};

export type NftMintInput = {
  receiver: Address;
  customTokenURI?: string;
};

export type NftMintResult = {
  txHash: `0x${string}`;
  tokenId?: bigint;
  receiver: Address;
  tokenURI?: string;
  imageURI?: string;
  metadataURI?: string;
  metadata?: NftMetadata;
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
