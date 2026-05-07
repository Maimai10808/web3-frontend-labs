"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApiClient } from "@/lib/api-client";
import { TASKS_QUERY_KEY } from "./use-tasks-query";
import type { CreateTaskInput } from "@/types/task";

export function useCreateTask() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const result = await taskApiClient.createTask(input);
      return result.task;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });

  return {
    createTask: mutation.mutateAsync,
    createdTask: mutation.data ?? null,
    isCreatingTask: mutation.isPending,
    createTaskError: mutation.error,
    resetCreateTask: mutation.reset,
  };
}
