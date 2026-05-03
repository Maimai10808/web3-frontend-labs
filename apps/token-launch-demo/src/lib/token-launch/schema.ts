import { z } from "zod";

const TOKEN_NAME_MAX_LENGTH = 15;
const TOKEN_SYMBOL_MAX_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 500;

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const optionalTrimmedString = z.preprocess(
  emptyStringToUndefined,
  z.string().optional(),
);

export const tokenLaunchFormSchema = z.object({
  tokenName: z
    .string()
    .trim()
    .min(1, "Token name is required.")
    .max(
      TOKEN_NAME_MAX_LENGTH,
      `Token name must be ${TOKEN_NAME_MAX_LENGTH} characters or fewer.`,
    ),

  tokenSymbol: z
    .string()
    .trim()
    .min(1, "Token symbol is required.")
    .max(
      TOKEN_SYMBOL_MAX_LENGTH,
      `Token symbol must be ${TOKEN_SYMBOL_MAX_LENGTH} characters or fewer.`,
    ),

  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`,
    ),

  website: optionalTrimmedString,
  twitter: optionalTrimmedString,
  telegram: optionalTrimmedString,

  logoFile: z
    .instanceof(File, { message: "Token logo is required." })
    .nullable()
    .refine((file) => file !== null, {
      message: "Token logo is required.",
    }),
});

export const tokenMetadataSchema = z.object({
  name: z.string().trim().min(1),
  symbol: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().trim().min(1),
  website: optionalTrimmedString,
  twitter: optionalTrimmedString,
  telegram: optionalTrimmedString,
  createdOn: z.string().trim().min(1),
});

export const nftCollectionFormSchema = z.object({
  name: z.string().trim().min(1, "Collection name is required."),
  symbol: z.string().trim().min(1, "Collection symbol is required."),
  contractURI: z.string().trim().min(1, "Contract URI is required."),
  baseTokenURI: z.string().trim().min(1, "Base token URI is required."),
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

export function validateTokenLaunchForm(
  values: z.input<typeof tokenLaunchFormSchema>,
) {
  return tokenLaunchFormSchema.safeParse(values);
}

export const tokenLaunchFieldLimits = {
  tokenName: TOKEN_NAME_MAX_LENGTH,
  tokenSymbol: TOKEN_SYMBOL_MAX_LENGTH,
  description: DESCRIPTION_MAX_LENGTH,
} as const;
