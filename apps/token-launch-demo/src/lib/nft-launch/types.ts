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

export type NftCollectionMetadataInput = {
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
};

export type NftCollectionMetadata = {
  name?: string;
  description?: string;
  image?: string;
  external_link?: string;
  external_url?: string;
};

export type NftCollectionFormValues = {
  name: string;
  symbol: string;
  description: string;
  externalUrl: string;
  maxSupply: string;
  mintPrice: string;
  collectionImageFile: File | null;
};

export type ValidatedNftCollectionFormValues = {
  name: string;
  symbol: string;
  description: string;
  externalUrl?: string;
  maxSupply: string;
  mintPrice: string;
  collectionImageFile: File;
};

export type UploadedCollectionImageResult = {
  imageURI: string;
  imageHash?: string;
  imageGatewayUrl?: string;
};

export type UploadedCollectionMetadataResult = {
  contractURI: string;
  metadataHash?: string;
  metadataGatewayUrl?: string;
  metadata: NftCollectionMetadata;
};

export type CreateNftCollectionResult = {
  txHash: `0x${string}`;
  collectionAddress: Address;
  creator: Address;
  name: string;
  symbol: string;
  contractURI: string;
  baseTokenURI: string;
  maxSupply: bigint;
  mintPrice: bigint;
  metadata?: NftCollectionMetadata;
  imageURI?: string;
  imageGatewayUrl?: string;
};

export type NftCollectionCreateStep =
  | "idle"
  | "image_uploading"
  | "metadata_building"
  | "metadata_uploading"
  | "wallet_confirming"
  | "tx_confirming"
  | "success"
  | "error";

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
  collectionAddress: Address;
  receiver: Address;
  mintPrice: bigint;
  customTokenURI?: string;
};

export type NftMintResult = {
  txHash: `0x${string}`;
  collectionAddress: Address;
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
  mintPrice: bigint;
};

export type NftCollectionCard = NftCollectionInfo & {
  address: Address;
  image?: string;
  description?: string;
  externalUrl?: string;
  creator?: Address;
  txHash?: `0x${string}`;
  blockNumber?: bigint;
};
