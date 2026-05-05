"use client";

import { useMutation } from "@tanstack/react-query";
import { decodeEventLog, formatUnits, type Address, type Hex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import {
  airdropGrowthClaimContract,
  rewardClaimedEventName,
  rewardTokenContract,
} from "@/lib/contracts/airdrop-growth";
import type { ClaimResult } from "@/lib/campaign/types";

export function useClaimReward() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const mutation = useMutation({
    mutationFn: async (): Promise<ClaimResult> => {
      if (!publicClient) {
        throw new Error("Public client is not ready.");
      }

      if (!address) {
        throw new Error("Wallet is not connected.");
      }

      const txHash = await writeContractAsync({
        ...airdropGrowthClaimContract,
        functionName: "claim",
        args: [],
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      let claimedAmount: bigint | null = null;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: airdropGrowthClaimContract.abi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === rewardClaimedEventName) {
            const args = decoded.args as {
              amount?: bigint;
            };

            if (typeof args.amount === "bigint") {
              claimedAmount = args.amount;
              break;
            }
          }
        } catch {
          continue;
        }
      }

      const [hasClaimed, rewardBalance] = await Promise.all([
        publicClient.readContract({
          ...airdropGrowthClaimContract,
          functionName: "hasClaimed",
          args: [address as Address],
        }) as Promise<boolean>,

        publicClient.readContract({
          ...rewardTokenContract,
          functionName: "balanceOf",
          args: [address as Address],
        }) as Promise<bigint>,
      ]);

      return {
        txHash: txHash as Hex,
        rewardType: "erc20",
        amount:
          claimedAmount !== null ? formatUnits(claimedAmount, 18) : undefined,
        claimedAt: Date.now(),
        hasClaimed,
        rewardBalance: formatUnits(rewardBalance, 18),
      };
    },
  });

  return {
    claimReward: mutation.mutateAsync,
    claimRewardResult: mutation.data ?? null,
    isClaimingReward: mutation.isPending,
    claimRewardError: mutation.error,
    resetClaimReward: mutation.reset,
  };
}
