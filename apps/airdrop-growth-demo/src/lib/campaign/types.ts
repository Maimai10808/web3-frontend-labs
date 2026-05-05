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
