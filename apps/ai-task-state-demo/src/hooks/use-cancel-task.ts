"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApiClient } from "@/lib/api-client";
import { TASKS_QUERY_KEY } from "./use-tasks-query";

export function useCancelTask() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (taskId: string) => {
      const result = await taskApiClient.cancelTask(taskId);
      return result.task;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });

  return {
    cancelTask: mutation.mutateAsync,
    cancelledTask: mutation.data ?? null,
    isCancellingTask: mutation.isPending,
    cancelTaskError: mutation.error,
    resetCancelTask: mutation.reset,
  };
}
