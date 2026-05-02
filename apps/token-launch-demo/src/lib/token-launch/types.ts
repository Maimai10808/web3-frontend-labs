import type { z } from "zod";
import type { tokenLaunchFormSchema, tokenMetadataSchema } from "./schema";

export type TokenLaunchFormValues = z.input<typeof tokenLaunchFormSchema>;
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
      type: "metadata_upload_succeeded";
      message: string;
      metadataUrl: string;
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
