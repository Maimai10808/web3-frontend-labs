"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";

import {
  nftMintSchema,
  type NftMintFormInput,
  type NftMintFormValues,
} from "@/lib/nft-launch/schema";
import { useMintNft } from "@/hooks/nft-launch/use-mint-nft";
import { NftTokenResultCard } from "./nft-token-result-card";

export function NftMintPanel() {
  const account = useAccount();
  const mintNft = useMintNft();

  const form = useForm<NftMintFormValues, unknown, NftMintFormInput>({
    resolver: zodResolver(nftMintSchema),
    defaultValues: {
      receiver: account.address ?? "",
      customTokenURI: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!account.address || form.getValues("receiver")) {
      return;
    }

    form.setValue("receiver", account.address, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [account.address, form]);

  function onSubmit(values: NftMintFormInput) {
    mintNft.mutate(values);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Mint NFT</h2>
        <p className="mt-1 text-sm text-gray-400">
          Mint an NFT from the deployed collection. You can use the collection
          baseURI or provide a custom tokenURI.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div>
          <label className="text-sm font-medium text-gray-200">Receiver</label>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
            placeholder="0x..."
            {...form.register("receiver")}
          />
          {form.formState.errors.receiver ? (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.receiver.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-200">
            Custom Token URI
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
            placeholder="ipfs://... or https://..."
            {...form.register("customTokenURI")}
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional. If empty, the contract will use baseTokenURI + tokenId.
          </p>
        </div>

        <button
          type="submit"
          disabled={
            !account.isConnected || !form.formState.isValid || mintNft.isPending
          }
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!account.isConnected
            ? "Connect Wallet"
            : mintNft.isPending
              ? "Minting..."
              : "Mint NFT"}
        </button>
      </form>

      {mintNft.isError ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {mintNft.error instanceof Error
            ? mintNft.error.message
            : "Mint failed."}
        </div>
      ) : null}

      <NftTokenResultCard result={mintNft.data ?? null} />
    </section>
  );
}
