/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { zeroAddress, type Address } from "viem";
import { useAccount, useChainId, useReadContract, useSignMessage } from "wagmi";
import { ClaimRewardCard } from "@/components/claim/claim-reward-card";
import { ClaimStatusCard } from "@/components/campaign/claim-status-card";
import { EligibilityCard } from "@/components/campaign/eligibility-card";
import { WalletStatusPanel } from "@/components/campaign/wallet-status-panel";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { ReferralCard } from "@/components/referral/referral-card";
import { ReferralPointsCard } from "@/components/referral/referral-points-card";
import { EventLog } from "@/components/shared/event-log";
import { TaskList } from "@/components/tasks/task-list";
import { AIRDROP_GROWTH_SIGN_MESSAGE } from "@/lib/campaign/constants";
import type {
  GrowthEvent,
  GrowthEventLogEntry,
  GrowthTask,
  SignMessagePayload,
} from "@/lib/campaign/types";
import {
  airdropGrowthChainId,
  airdropGrowthClaimContract,
} from "@/lib/contracts/airdrop-growth";
import { useClaimReward } from "@/hooks/claim/use-claim-reward";
import { useClaimStatus } from "@/hooks/campaign/use-claim-status";
import { useEligibility } from "@/hooks/campaign/use-eligibility";
import { useLeaderboard } from "@/hooks/leaderboard/use-leaderboard";
import { useReferral } from "@/hooks/referral/use-referral";

export function AirdropGrowthDemoShell() {
  const [tasks, setTasks] = useState<GrowthTask[]>([]);
  const [eventLogs, setEventLogs] = useState<GrowthEventLogEntry[]>([]);

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

  const { referralStats, referralLink, isLoadingReferral, referralError } =
    useReferral();

  const { leaderboard, isLoadingLeaderboard, leaderboardError } =
    useLeaderboard();

  const { claimReward, claimRewardResult, isClaimingReward, claimRewardError } =
    useClaimReward();

  const appendEvent = (event: GrowthEvent) => {
    setEventLogs((prev) => [createEventLogEntry(event), ...prev]);
  };

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

    appendEvent({
      type: "wallet_signed",
      message: "Wallet signature completed for the sign message task.",
    });

    return {
      message: AIRDROP_GROWTH_SIGN_MESSAGE,
      signature,
    };
  };

  const handleClaimReward = async () => {
    appendEvent({
      type: "claim_submitted",
      message: "Reward claim transaction submitted.",
      txHash: "pending",
    });

    await claimReward();
  };

  useEffect(() => {
    if (isConnected && address) {
      appendEvent({
        type: "wallet_connected",
        message: "Wallet connected to the growth campaign.",
        address,
      });
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (eligibility) {
      appendEvent({
        type: "eligibility_updated",
        message: `Eligibility recalculated with ${eligibility.totalPoints} points.`,
        claimStatus: eligibility.claimStatus,
      });
    }
  }, [eligibility]);

  useEffect(() => {
    if (referralStats) {
      appendEvent({
        type: "referral_loaded",
        message: `Referral stats loaded with ${referralStats.invitedCount} invited users.`,
      });
    }
  }, [referralStats]);

  useEffect(() => {
    if (leaderboard.length > 0) {
      appendEvent({
        type: "leaderboard_loaded",
        message: `Leaderboard loaded with ${leaderboard.length} ranked wallets.`,
      });
    }
  }, [leaderboard]);

  useEffect(() => {
    if (claimRewardResult?.txHash) {
      appendEvent({
        type: "claim_confirmed",
        message: "Reward claim transaction confirmed.",
        txHash: claimRewardResult.txHash,
      });
    }
  }, [claimRewardResult]);

  useEffect(() => {
    if (claimRewardError instanceof Error) {
      appendEvent({
        type: "claim_failed",
        message: claimRewardError.message,
      });
    }
  }, [claimRewardError]);

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

      <ClaimRewardCard
        claimStatus={claimStatus}
        onClaim={handleClaimReward}
        result={claimRewardResult}
        isClaiming={isClaimingReward}
        errorMessage={
          claimRewardError instanceof Error ? claimRewardError.message : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReferralCard
          referralLink={referralLink}
          isLoading={isLoadingReferral}
          errorMessage={
            referralError instanceof Error ? referralError.message : null
          }
        />
        <ReferralPointsCard
          referralStats={referralStats}
          isLoading={isLoadingReferral}
          errorMessage={
            referralError instanceof Error ? referralError.message : null
          }
        />
      </div>

      <LeaderboardTable
        items={leaderboard}
        isLoading={isLoadingLeaderboard}
        errorMessage={
          leaderboardError instanceof Error ? leaderboardError.message : null
        }
      />

      <EventLog entries={eventLogs} />
    </div>
  );
}

function createEventLogEntry(event: GrowthEvent): GrowthEventLogEntry {
  return {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleString(),
  };
}
