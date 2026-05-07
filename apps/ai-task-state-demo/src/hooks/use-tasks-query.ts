"use client";

import { useQuery } from "@tanstack/react-query";
import { taskApiClient } from "@/lib/api-client";
import type { Task } from "@/types/task";

export const TASKS_QUERY_KEY = ["ai-task-state-demo", "tasks"] as const;

export function useTasksQuery() {
  const query = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: async (): Promise<Task[]> => {
      const result = await taskApiClient.listTasks();
      return result.tasks;
    },
    staleTime: 5_000,
  });

  return {
    tasks: query.data ?? [],
    isLoadingTasks: query.isLoading,
    tasksError: query.error,
    refetchTasks: query.refetch,
    tasksQuery: query,
  };
}
