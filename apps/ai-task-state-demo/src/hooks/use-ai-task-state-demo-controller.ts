"use client";

import { useEffect, useMemo, useState } from "react";
import type { PendingTaskAction } from "@/components/task-actions";
import { useCancelTask } from "@/hooks/use-cancel-task";
import { useCreateTask } from "@/hooks/use-create-task";
import { useRetryTask } from "@/hooks/use-retry-task";
import { useTaskStream } from "@/hooks/use-task-stream";
import { useTasksQuery } from "@/hooks/use-tasks-query";
import {
  isActiveTaskStatus,
  type TaskSyncMode,
  type UploadAsset,
} from "@/types/task";

export function useAiTaskStateDemoController() {
  const [syncMode, setSyncMode] = useState<TaskSyncMode>("sse");
  const [pendingAction, setPendingAction] = useState<PendingTaskAction>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { tasks, isLoadingTasks, tasksError, refetchTasks, tasksQuery } =
    useTasksQuery();

  const { createTask, isCreatingTask, createTaskError } = useCreateTask();
  const { cancelTask, isCancellingTask } = useCancelTask();
  const { retryTask, isRetryingTask } = useRetryTask();

  useTaskStream({
    enabled: syncMode === "sse",
  });

  useEffect(() => {
    if (syncMode !== "polling") {
      return;
    }

    const timer = window.setInterval(() => {
      void refetchTasks();
    }, 2_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [syncMode, refetchTasks]);

  const handleCreateTextTask = async (prompt: string) => {
    setActionError(null);

    await createTask({
      type: "text-to-image",
      prompt,
    });
  };

  const handleCreateImageTask = async (input: {
    prompt: string;
    sourceImage: UploadAsset;
  }) => {
    setActionError(null);

    await createTask({
      type: "image-to-image",
      prompt: input.prompt,
      sourceImage: input.sourceImage,
    });
  };

  const handleCancelTask = async (taskId: string) => {
    setActionError(null);
    setPendingAction({
      taskId,
      type: "cancel",
    });

    try {
      await cancelTask(taskId);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to cancel task.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleRetryTask = async (taskId: string) => {
    setActionError(null);
    setPendingAction({
      taskId,
      type: "retry",
    });

    try {
      await retryTask(taskId);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to retry task.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const stats = useMemo(() => {
    const active = tasks.filter((task) =>
      isActiveTaskStatus(task.status),
    ).length;
    const succeeded = tasks.filter(
      (task) => task.status === "succeeded",
    ).length;
    const failed = tasks.filter((task) => task.status === "failed").length;
    const cancelled = tasks.filter(
      (task) => task.status === "cancelled",
    ).length;

    return {
      total: tasks.length,
      active,
      succeeded,
      failed,
      cancelled,
    };
  }, [tasks]);

  return {
    syncMode,
    setSyncMode,
    tasks,
    isLoadingTasks,
    tasksError,
    refetchTasks,
    tasksQuery,
    isCreatingTask,
    createTaskError,
    isCancellingTask,
    isRetryingTask,
    pendingAction,
    actionError,
    handleCreateTextTask,
    handleCreateImageTask,
    handleCancelTask,
    handleRetryTask,
    stats,
  };
}

export type AiTaskStateDemoController = ReturnType<
  typeof useAiTaskStateDemoController
>;
