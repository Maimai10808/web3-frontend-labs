import { useMutation, useQueryClient } from "@tanstack/react-query";
import { decodeEventLog } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

import {
  nftCollectionContract,
  nftCollectionMintedEventName,
} from "@/lib/contracts/nft-contracts";
import { buildMintArgs } from "@/lib/nft-launch/build-mint-args";
import type { NftMintFormInput } from "@/lib/nft-launch/schema";
import type { NftMintResult } from "@/lib/nft-launch/types";

export function useMintNft() {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const writeContract = useWriteContract();

  return useMutation({
    async mutationFn(input: NftMintFormInput): Promise<NftMintResult> {
      if (!publicClient) {
        throw new Error("Public client is not ready.");
      }

      const mintCall = buildMintArgs(input);

      const txHash = await writeContract.writeContractAsync({
        address: nftCollectionContract.address,
        abi: nftCollectionContract.abi,
        functionName: mintCall.functionName,
        args: mintCall.args,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      let tokenId: bigint | undefined;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: nftCollectionContract.abi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === nftCollectionMintedEventName) {
            tokenId = decoded.args.tokenId;
          }
        } catch {
          // Ignore logs from other contracts.
        }
      }

      if (tokenId === undefined) {
        throw new Error(
          "CollectionMinted event not found in transaction receipt.",
        );
      }

      const tokenURI = await publicClient.readContract({
        address: nftCollectionContract.address,
        abi: nftCollectionContract.abi,
        functionName: "tokenURI",
        args: [tokenId],
      });

      return {
        txHash,
        tokenId,
        receiver: input.receiver as NftMintResult["receiver"],
        tokenURI,
      };
    },

    onSuccess() {
      void queryClient.invalidateQueries();
    },
  });
}
