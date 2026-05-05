"use client";

import { useEffect } from "react";
import type { Address } from "viem";
import type { GrowthTask, SignMessagePayload } from "@/lib/campaign/types";
import { useTaskList } from "@/hooks/tasks/use-task-list";
import { useVerifyTask } from "@/hooks/tasks/use-verify-task";
import { TaskCard } from "./task-card";
import { TaskVerificationResult } from "./task-verification-result";

type TaskListProps = {
  walletAddress?: Address;
  onSignMessage?: () => Promise<SignMessagePayload | null>;
  onTasksChange?: (tasks: GrowthTask[]) => void;
};

export function TaskList({
  walletAddress,
  onSignMessage,
  onTasksChange,
}: TaskListProps) {
  const { tasks, isLoadingTasks, taskListError } = useTaskList(walletAddress);
  const { verifyTask, verificationResult, isVerifyingTask, verifyTaskError } =
    useVerifyTask(walletAddress);

  useEffect(() => {
    onTasksChange?.(tasks);
  }, [tasks, onTasksChange]);

  const handleVerify = async (task: GrowthTask) => {
    if (task.type === "sign_message" && onSignMessage) {
      const signed = await onSignMessage();

      await verifyTask({
        taskId: task.id,
        taskType: task.type,
        walletAddress,
        signature: signed?.signature,
        message: signed?.message,
      });

      return;
    }

    await verifyTask({
      taskId: task.id,
      taskType: task.type,
      walletAddress,
    });
  };

  if (isLoadingTasks) {
    return (
      <section className="grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-gray-900 p-4 text-sm text-gray-300">
          Loading tasks...
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-gray-900 p-4">
        <h2 className="text-lg font-semibold text-white">Growth Tasks</h2>
        <p className="mt-1 text-sm text-gray-400">
          Complete social and wallet tasks to unlock airdrop eligibility.
        </p>
      </div>

      {taskListError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {taskListError instanceof Error
            ? taskListError.message
            : "Failed to load tasks."}
        </div>
      ) : null}

      {verifyTaskError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {verifyTaskError instanceof Error
            ? verifyTaskError.message
            : "Failed to verify task."}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isVerifying={isVerifyingTask}
            onVerify={handleVerify}
          />
        ))}
      </div>

      <TaskVerificationResult result={verificationResult} />
    </section>
  );
}
