"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import type { VerifyTaskRequest, VerifyTaskResult } from "@/lib/campaign/types";
import { buildTaskListQueryKey } from "./use-task-list";

type VerifyTaskResponse = {
  ok: boolean;
  message?: string;
  result?: VerifyTaskResult;
};

export function useVerifyTask(walletAddress?: Address) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: VerifyTaskRequest): Promise<VerifyTaskResult> => {
      if (input.taskType === "connect_wallet") {
        if (!walletAddress) {
          return {
            taskId: input.taskId,
            taskType: input.taskType,
            status: "failed",
            pointsAwarded: 0,
            message: "Wallet is not connected.",
          };
        }

        return {
          taskId: input.taskId,
          taskType: input.taskType,
          status: "verified",
          pointsAwarded: 100,
          message: "Wallet connection verified on the client.",
          verifiedAt: Date.now(),
        };
      }

      const response = await fetch("/api/tasks/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...input,
          walletAddress,
        }),
      });

      const payload = (await response.json()) as VerifyTaskResponse;

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message ?? "Task verification failed.");
      }

      return payload.result;
    },

    onSuccess: (result) => {
      queryClient.setQueryData(
        buildTaskListQueryKey(walletAddress),
        (current: unknown) => {
          if (!Array.isArray(current)) {
            return current;
          }

          return current.map((task) => {
            if (
              typeof task === "object" &&
              task !== null &&
              "id" in task &&
              task.id === result.taskId
            ) {
              return {
                ...task,
                status: result.status,
                verifiedAt: result.verifiedAt,
                errorMessage:
                  result.status === "failed" ? result.message : undefined,
              };
            }

            return task;
          });
        },
      );
    },
  });

  return {
    verifyTask: mutation.mutateAsync,
    verificationResult: mutation.data ?? null,
    isVerifyingTask: mutation.isPending,
    verifyTaskError: mutation.error,
    resetVerifyTask: mutation.reset,
  };
}
