import type { z } from "zod";
import type {
  nftCollectionFormSchema,
  tokenLaunchFormSchema,
  tokenMetadataSchema,
} from "./schema";
import type { Address, Hash } from "viem";

export type TokenLaunchFormValues = {
  tokenName: string;
  tokenSymbol: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  logoFile: File | null;
};

export type ValidatedTokenLaunchFormValues = z.output<
  typeof tokenLaunchFormSchema
>;

export type TokenMetadataInput = {
  name: string;
  symbol: string;
  description: string;
  website?: string;
  twitter?: string;
  telegram?: string;
};

export type TokenMetadataJson = z.output<typeof tokenMetadataSchema>;

export type UploadedTokenLogo = {
  imageUrl: string;
  imageHash?: string;
};

export type UploadedTokenMetadata = {
  metadataUrl: string;
  metadataHash?: string;
  metadata: TokenMetadataJson;
};

export type CreateTokenResult = {
  txHash: string;
  tokenAddress: string;
  metadataUrl: string;
  tokenName?: string;
  tokenSymbol?: string;
  maxSupply?: string;
};

export type TokenInfo = {
  tokenAddress: string;
  creator: string;
  owner: string;
  name: string;
  symbol: string;
  totalSupply: string;
  maxSupply: string;
  metadataUrl: string;
  createdAt: number;
};

export type NftCollectionFormValues = z.input<typeof nftCollectionFormSchema>;

export type ValidatedNftCollectionFormValues = z.output<
  typeof nftCollectionFormSchema
>;

export type CreateNftCollectionResult = {
  txHash: Hash;
  collectionAddress: Address;
  creator: Address;
  name: string;
  symbol: string;
  contractURI: string;
  baseTokenURI: string;
  maxSupply: bigint;
  mintPrice: bigint;
};

export type TokenLaunchStep =
  | "idle"
  | "logo_uploading"
  | "metadata_building"
  | "metadata_uploading"
  | "wallet_confirming"
  | "tx_pending"
  | "tx_confirming"
  | "success"
  | "error";

export type TokenLaunchProgressItem = {
  key: TokenLaunchStep;
  label: string;
  description: string;
  status: "idle" | "active" | "done" | "error";
};

export type TokenLaunchEvent =
  | {
      type: "logo_upload_started";
      message: string;
    }
  | {
      type: "logo_upload_succeeded";
      message: string;
      imageUrl: string;
    }
  | {
      type: "metadata_upload_started";
      message: string;
    }
  | {
      type: "metadata_built";
      message: string;
    }
  | {
      type: "metadata_upload_succeeded";
      message: string;
      metadataUrl: string;
    }
  | {
      type: "wallet_confirmation_requested";
      message: string;
    }
  | {
      type: "transaction_submitted";
      message: string;
      txHash: string;
    }
  | {
      type: "transaction_confirmed";
      message: string;
      txHash: string;
    }
  | {
      type: "token_create_started";
      message: string;
    }
  | {
      type: "token_create_submitted";
      message: string;
      txHash: string;
    }
  | {
      type: "token_create_succeeded";
      message: string;
      txHash: string;
      tokenAddress: string;
    }
  | {
      type: "token_create_failed";
      message: string;
      reason?: string;
    };
