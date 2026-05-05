"use client";

import { useState } from "react";
import { zeroAddress, type Address } from "viem";
import { useAccount, useChainId, useReadContract, useSignMessage } from "wagmi";
import { ClaimRewardCard } from "@/components/claim/claim-reward-card";
import { ClaimStatusCard } from "@/components/campaign/claim-status-card";
import { EligibilityCard } from "@/components/campaign/eligibility-card";
import { WalletStatusPanel } from "@/components/campaign/wallet-status-panel";
import { TaskList } from "@/components/tasks/task-list";
import type { GrowthTask, SignMessagePayload } from "@/lib/campaign/types";
import { AIRDROP_GROWTH_SIGN_MESSAGE } from "@/lib/campaign/constants";
import {
  airdropGrowthChainId,
  airdropGrowthClaimContract,
} from "@/lib/contracts/airdrop-growth";
import { useClaimStatus } from "@/hooks/campaign/use-claim-status";
import { useEligibility } from "@/hooks/campaign/use-eligibility";

export function AirdropGrowthDemoShell() {
  const [tasks, setTasks] = useState<GrowthTask[]>([]);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isExpectedChain = chainId === airdropGrowthChainId;
  const { signMessageAsync } = useSignMessage();

  const hasClaimedQuery = useReadContract({
    ...airdropGrowthClaimContract,
    functionName: "hasClaimed",
    args: [(address ?? zeroAddress) as Address],
    query: {
      enabled: isConnected && Boolean(address) && isExpectedChain,
    },
  });

  const hasClaimed = hasClaimedQuery.data ?? false;

  const { eligibility, isLoadingEligibility, eligibilityError } =
    useEligibility({
      tasks,
      hasClaimed,
    });

  const { claimStatus, isLoadingClaimStatus, claimStatusError } =
    useClaimStatus({
      tasks,
      hasClaimed,
    });

  const handleSignMessage = async (): Promise<SignMessagePayload | null> => {
    if (!isConnected || !address) {
      throw new Error("Wallet is not connected.");
    }

    if (!isExpectedChain) {
      throw new Error(`Please switch to chain ${airdropGrowthChainId}.`);
    }

    const signature = await signMessageAsync({
      message: AIRDROP_GROWTH_SIGN_MESSAGE,
    });

    return {
      message: AIRDROP_GROWTH_SIGN_MESSAGE,
      signature,
    };
  };

  return (
    <div className="grid gap-6">
      <WalletStatusPanel />

      <TaskList
        walletAddress={address}
        onTasksChange={setTasks}
        onSignMessage={handleSignMessage}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <EligibilityCard
          eligibility={eligibility}
          isLoading={isLoadingEligibility}
          errorMessage={
            eligibilityError instanceof Error ? eligibilityError.message : null
          }
        />
        <ClaimStatusCard
          claimStatus={claimStatus}
          isLoading={isLoadingClaimStatus || hasClaimedQuery.isLoading}
          errorMessage={
            claimStatusError instanceof Error
              ? claimStatusError.message
              : hasClaimedQuery.error instanceof Error
                ? hasClaimedQuery.error.message
                : null
          }
        />
      </div>

      <ClaimRewardCard claimStatus={claimStatus} />
    </div>
  );
}
