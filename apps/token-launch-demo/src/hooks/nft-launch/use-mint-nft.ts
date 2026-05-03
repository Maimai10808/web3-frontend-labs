import { useMutation, useQueryClient } from "@tanstack/react-query";
import { decodeEventLog } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

import {
  launchERC721CollectionAbi,
  nftCollectionMintedEventName,
} from "@/lib/contracts/nft-contracts";
import { buildMintArgs } from "@/lib/nft-launch/build-mint-args";
import type { NftMintInput, NftMintResult } from "@/lib/nft-launch/types";

export function useMintNft() {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const writeContract = useWriteContract();

  return useMutation({
    async mutationFn(input: NftMintInput): Promise<NftMintResult> {
      if (!publicClient) {
        throw new Error("Public client is not ready.");
      }

      const mintCall = buildMintArgs(input);

      const txHash = await writeContract.writeContractAsync({
        address: input.collectionAddress,
        abi: launchERC721CollectionAbi,
        functionName: mintCall.functionName,
        args: mintCall.args,
        value: mintCall.value,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      let tokenId: bigint | undefined;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: launchERC721CollectionAbi,
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
        address: input.collectionAddress,
        abi: launchERC721CollectionAbi,
        functionName: "tokenURI",
        args: [tokenId],
      });

      return {
        txHash,
        collectionAddress: input.collectionAddress,
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
