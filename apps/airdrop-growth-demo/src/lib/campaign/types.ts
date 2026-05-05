import type { Address, Hex } from "viem";

export type TaskType =
  | "follow"
  | "join"
  | "connect_wallet"
  | "sign_message"
  | "visit_website";

export type TaskStatus =
  | "locked"
  | "ready"
  | "verifying"
  | "verified"
  | "failed";

export type TaskVerifyMode =
  | "mock_api"
  | "frontend_wallet"
  | "wallet_signature";

export type GrowthTaskDefinition = {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  points: number;
  verifyLabel: string;
  verifyMode: TaskVerifyMode;
  href?: string;
};

export type GrowthTask = GrowthTaskDefinition & {
  status: TaskStatus;
  errorMessage?: string;
  verifiedAt?: number;
};

export type VerifyTaskRequest = {
  taskId: string;
  taskType: TaskType;
  walletAddress?: Address;
  signature?: Hex;
  message?: string;
};

export type VerifyTaskResult = {
  taskId: string;
  taskType: TaskType;
  status: Extract<TaskStatus, "verified" | "failed">;
  pointsAwarded: number;
  message: string;
  verifiedAt?: number;
};

export type SignMessagePayload = {
  message: string;
  signature: Hex;
};

export type ClaimStatus = "unqualified" | "claimable" | "claimed" | "expired";

export type EligibilityResult = {
  qualified: boolean;
  reason?: string;
  totalPoints: number;
  pointsThreshold: number;
  claimStatus: ClaimStatus;
};

export type CampaignState = {
  campaignId: string;
  title: string;
  rewardType: "erc20" | "nft";
  claimDeadline: number;
  pointsThreshold: number;
  totalPoints: number;
  claimStatus: ClaimStatus;
};

export type ClaimResult = {
  txHash: string;
  rewardType: "erc20" | "nft";
  amount?: string;
  tokenId?: string;
  claimedAt: number;
  hasClaimed: boolean;
  rewardBalance?: string;
};

export type ReferralStats = {
  address: string;
  referralCode: string;
  referralLink: string;
  invitedCount: number;
  referralPoints: number;
  rewardMultiplier: number;
};

export type LeaderboardItem = {
  rank: number;
  address: string;
  displayName?: string;
  points: number;
  invitedCount: number;
  rewardMultiplier: number;
};

export type GrowthEvent =
  | {
      type: "wallet_connected";
      message: string;
      address?: string;
    }
  | {
      type: "wallet_signed";
      message: string;
    }
  | {
      type: "task_verified";
      message: string;
      taskId: string;
    }
  | {
      type: "task_verification_failed";
      message: string;
      taskId: string;
    }
  | {
      type: "eligibility_updated";
      message: string;
      claimStatus: ClaimStatus;
    }
  | {
      type: "claim_submitted";
      message: string;
      txHash: string;
    }
  | {
      type: "claim_confirmed";
      message: string;
      txHash: string;
    }
  | {
      type: "claim_failed";
      message: string;
    }
  | {
      type: "referral_loaded";
      message: string;
    }
  | {
      type: "leaderboard_loaded";
      message: string;
    };

export type GrowthEventLogEntry = GrowthEvent & {
  id: string;
  createdAt: string;
};
