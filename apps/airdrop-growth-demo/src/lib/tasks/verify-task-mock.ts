import type { VerifyTaskRequest, VerifyTaskResult } from "@/lib/campaign/types";
import { TASK_DEFINITIONS } from "./task-definitions";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function verifyTaskMock(
  input: VerifyTaskRequest,
): Promise<VerifyTaskResult> {
  const task = TASK_DEFINITIONS.find((item) => item.id === input.taskId);

  if (!task) {
    return {
      taskId: input.taskId,
      taskType: input.taskType,
      status: "failed",
      pointsAwarded: 0,
      message: "Task not found.",
    };
  }

  await sleep(600);

  if (task.type === "connect_wallet") {
    if (!input.walletAddress) {
      return {
        taskId: task.id,
        taskType: task.type,
        status: "failed",
        pointsAwarded: 0,
        message: "Wallet is not connected.",
      };
    }

    return {
      taskId: task.id,
      taskType: task.type,
      status: "verified",
      pointsAwarded: task.points,
      message: "Wallet connection verified.",
      verifiedAt: Date.now(),
    };
  }

  if (task.type === "sign_message") {
    if (!input.walletAddress) {
      return {
        taskId: task.id,
        taskType: task.type,
        status: "failed",
        pointsAwarded: 0,
        message: "Wallet is not connected.",
      };
    }

    if (input.signature && input.message) {
      return {
        taskId: task.id,
        taskType: task.type,
        status: "verified",
        pointsAwarded: task.points,
        message: "Wallet signature verified.",
        verifiedAt: Date.now(),
      };
    }

    return {
      taskId: task.id,
      taskType: task.type,
      status: "verified",
      pointsAwarded: task.points,
      message: "Mock signature verified.",
      verifiedAt: Date.now(),
    };
  }

  return {
    taskId: task.id,
    taskType: task.type,
    status: "verified",
    pointsAwarded: task.points,
    message: `${task.title} verified by mock backend.`,
    verifiedAt: Date.now(),
  };
}
