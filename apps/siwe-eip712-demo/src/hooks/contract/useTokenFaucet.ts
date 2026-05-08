"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import { contracts } from "@/src/lib/contracts";

export function useTokenFaucet() {
  const { address } = useAccount();

  const claimAmount = useReadContract({
    ...contracts.tokenFaucet,
    functionName: "claimAmount",
  });

  const cooldown = useReadContract({
    ...contracts.tokenFaucet,
    functionName: "cooldown",
  });

  const canClaim = useReadContract({
    ...contracts.tokenFaucet,
    functionName: "canClaim",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const lastClaimedAt = useReadContract({
    ...contracts.tokenFaucet,
    functionName: "lastClaimedAt",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  async function claim() {
    return writeContractAsync({
      ...contracts.tokenFaucet,
      functionName: "claim",
    });
  }

  return {
    canClaim: canClaim.data ?? false,
    claimAmount: claimAmount.data ? formatUnits(claimAmount.data, 18) : "0",
    cooldown: cooldown.data,
    lastClaimedAt: lastClaimedAt.data,
    claim,
    isClaimPending: isPending,
    refetchCanClaim: canClaim.refetch,
  };
}
