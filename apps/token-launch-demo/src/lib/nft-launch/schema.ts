import { isAddress } from "viem";
import { z } from "zod";

export const nftMintSchema = z.object({
  receiver: z
    .string()
    .min(1, "Receiver address is required.")
    .refine((value) => isAddress(value), "Invalid receiver address."),
  customTokenURI: z.string().optional(),
});

export type NftMintFormValues = z.input<typeof nftMintSchema>;
export type NftMintFormInput = z.output<typeof nftMintSchema>;
