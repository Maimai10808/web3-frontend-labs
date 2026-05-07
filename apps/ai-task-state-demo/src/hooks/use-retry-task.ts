"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApiClient } from "@/lib/api-client";
import { TASKS_QUERY_KEY } from "./use-tasks-query";

export function useRetryTask() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (taskId: string) => {
      const result = await taskApiClient.retryTask(taskId);
      return result.task;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });

  return {
    retryTask: mutation.mutateAsync,
    retriedTask: mutation.data ?? null,
    isRetryingTask: mutation.isPending,
    retryTaskError: mutation.error,
    resetRetryTask: mutation.reset,
  };
}
