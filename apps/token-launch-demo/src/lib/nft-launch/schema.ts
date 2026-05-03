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
