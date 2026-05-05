/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { zeroAddress, type Address } from "viem";
import { useAccount, useChainId, useReadContract, useSignMessage } from "wagmi";

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

export function useAirdropGrowthDemo() {
  const [tasks, setTasks] = useState<GrowthTask[]>([]);
  const [eventLogs, setEventLogs] = useState<GrowthEventLogEntry[]>([]);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const isExpectedChain = chainId === airdropGrowthChainId;

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

  const appendEvent = useCallback((event: GrowthEvent) => {
    setEventLogs((prev) => [createEventLogEntry(event), ...prev]);
  }, []);

  const handleSignMessage =
    useCallback(async (): Promise<SignMessagePayload | null> => {
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
    }, [address, appendEvent, isConnected, isExpectedChain, signMessageAsync]);

  const handleClaimReward = useCallback(async () => {
    appendEvent({
      type: "claim_submitted",
      message: "Reward claim transaction submitted.",
      txHash: "pending",
    });

    await claimReward();
  }, [appendEvent, claimReward]);

  useEffect(() => {
    if (!isConnected || !address) return;

    appendEvent({
      type: "wallet_connected",
      message: "Wallet connected to the growth campaign.",
      address,
    });
  }, [appendEvent, isConnected, address]);

  useEffect(() => {
    if (!eligibility) return;

    appendEvent({
      type: "eligibility_updated",
      message: `Eligibility recalculated with ${eligibility.totalPoints} points.`,
      claimStatus: eligibility.claimStatus,
    });
  }, [appendEvent, eligibility]);

  useEffect(() => {
    if (!referralStats) return;

    appendEvent({
      type: "referral_loaded",
      message: `Referral stats loaded with ${referralStats.invitedCount} invited users.`,
    });
  }, [appendEvent, referralStats]);

  useEffect(() => {
    if (leaderboard.length === 0) return;

    appendEvent({
      type: "leaderboard_loaded",
      message: `Leaderboard loaded with ${leaderboard.length} ranked wallets.`,
    });
  }, [appendEvent, leaderboard]);

  useEffect(() => {
    if (!claimRewardResult?.txHash) return;

    appendEvent({
      type: "claim_confirmed",
      message: "Reward claim transaction confirmed.",
      txHash: claimRewardResult.txHash,
    });
  }, [appendEvent, claimRewardResult]);

  useEffect(() => {
    if (!(claimRewardError instanceof Error)) return;

    appendEvent({
      type: "claim_failed",
      message: claimRewardError.message,
    });
  }, [appendEvent, claimRewardError]);

  const eligibilityErrorMessage =
    eligibilityError instanceof Error ? eligibilityError.message : null;

  const claimStatusErrorMessage =
    claimStatusError instanceof Error
      ? claimStatusError.message
      : hasClaimedQuery.error instanceof Error
        ? hasClaimedQuery.error.message
        : null;

  const referralErrorMessage =
    referralError instanceof Error ? referralError.message : null;

  const leaderboardErrorMessage =
    leaderboardError instanceof Error ? leaderboardError.message : null;

  const claimRewardErrorMessage =
    claimRewardError instanceof Error ? claimRewardError.message : null;

  return {
    wallet: {
      address,
      isConnected,
      chainId,
      isExpectedChain,
    },

    tasks: {
      items: tasks,
      setTasks,
      handleSignMessage,
    },

    eligibility: {
      data: eligibility,
      isLoading: isLoadingEligibility,
      errorMessage: eligibilityErrorMessage,
    },

    claimStatus: {
      data: claimStatus,
      isLoading: isLoadingClaimStatus || hasClaimedQuery.isLoading,
      errorMessage: claimStatusErrorMessage,
    },

    claimReward: {
      handleClaimReward,
      result: claimRewardResult,
      isClaiming: isClaimingReward,
      errorMessage: claimRewardErrorMessage,
    },

    referral: {
      stats: referralStats,
      link: referralLink,
      isLoading: isLoadingReferral,
      errorMessage: referralErrorMessage,
    },

    leaderboard: {
      items: leaderboard,
      isLoading: isLoadingLeaderboard,
      errorMessage: leaderboardErrorMessage,
    },

    eventLog: {
      entries: eventLogs,
      appendEvent,
    },
  };
}

function createEventLogEntry(event: GrowthEvent): GrowthEventLogEntry {
  return {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleString(),
  };
}
