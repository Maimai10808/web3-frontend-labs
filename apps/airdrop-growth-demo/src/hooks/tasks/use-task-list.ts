"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import type { GrowthTask } from "@/lib/campaign/types";
import { buildInitialTaskList } from "@/lib/tasks/task-definitions";

export function buildTaskListQueryKey(walletAddress?: Address) {
  return [
    "airdrop-growth-demo",
    "tasks",
    walletAddress ?? "disconnected",
  ] as const;
}

export function useTaskList(walletAddress?: Address) {
  const query = useQuery({
    queryKey: buildTaskListQueryKey(walletAddress),
    queryFn: async (): Promise<GrowthTask[]> => {
      return buildInitialTaskList(walletAddress);
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  return {
    tasks: query.data ?? [],
    isLoadingTasks: query.isLoading,
    taskListError: query.error,
    refetchTasks: query.refetch,
  };
}
