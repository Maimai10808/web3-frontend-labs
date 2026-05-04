import { isAddress } from "viem";
import { z } from "zod";

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().url("Enter a valid URL.").optional(),
);

export const nftMintSchema = z
  .object({
    receiver: z
      .string()
      .min(1, "Receiver address is required.")
      .refine((value) => isAddress(value), "Invalid receiver address."),
    name: z.string().trim(),
    description: z.string().trim(),
    externalUrl: z
      .string()
      .trim()
      .refine((value) => {
        if (!value) {
          return true;
        }

        return z.string().url().safeParse(value).success;
      }, "Enter a valid URL."),
    attributesText: z.string().trim(),
    customTokenURI: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    if (value.customTokenURI) {
      return;
    }

    if (!value.name) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "NFT name is required.",
      });
    }

    if (!value.description) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message: "NFT description is required.",
      });
    }
  });

export type NftMintFormValues = {
  receiver: string;
  name: string;
  description: string;
  externalUrl: string;
  attributesText: string;
  customTokenURI: string;
};
export type NftMintFormInput = z.output<typeof nftMintSchema>;

export const nftCollectionFormSchema = z.object({
  name: z.string().trim().min(1, "Collection name is required."),
  symbol: z.string().trim().min(1, "Collection symbol is required."),
  description: z.string().trim().min(1, "Description is required."),
  externalUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) {
        return true;
      }

      return z.string().url().safeParse(value).success;
    }, "Enter a valid URL."),
  collectionImageFile: z
    .instanceof(File, { message: "Collection image is required." })
    .nullable()
    .refine((file) => file !== null, {
      message: "Collection image is required.",
    })
    .transform((file) => file as File),
  maxSupply: z
    .string()
    .trim()
    .min(1, "Max supply is required.")
    .regex(/^\d+$/, "Max supply must be a positive integer.")
    .refine((value) => BigInt(value) > BigInt(0), {
      message: "Max supply must be greater than 0.",
    }),
  mintPrice: z
    .string()
    .trim()
    .min(1, "Mint price is required.")
    .refine((value) => {
      try {
        return Number(value) >= 0;
      } catch {
        return false;
      }
    }, "Mint price must be a non-negative ETH value."),
});

export type NftCollectionFormInput = z.input<typeof nftCollectionFormSchema>;
export type NftCollectionFormOutput = z.output<typeof nftCollectionFormSchema>;

export const nftMetadataSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().trim().min(1),
  external_url: optionalUrl,
  attributes: z
    .array(
      z.object({
        trait_type: z.string().trim().min(1),
        value: z.union([z.string().trim().min(1), z.number()]),
      }),
    )
    .optional(),
});
