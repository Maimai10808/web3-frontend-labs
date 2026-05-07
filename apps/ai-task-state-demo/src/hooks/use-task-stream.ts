"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { applyTaskEventToList } from "@/lib/api-client";
import { TASKS_QUERY_KEY } from "./use-tasks-query";
import type { Task, TaskEvent } from "@/types/task";

type UseTaskStreamParams = {
  enabled?: boolean;
};

export function useTaskStream({ enabled = true }: UseTaskStreamParams = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const source = new EventSource("/api/tasks/stream");

    const handleTaskEvent = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as TaskEvent;

        queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (current = []) => {
          return applyTaskEventToList(current, payload);
        });
      } catch (error) {
        console.error("Failed to parse task stream payload:", error);
      }
    };

    source.addEventListener("task", handleTaskEvent);

    source.addEventListener("error", () => {
      // 浏览器会自动重连 SSE，这里先不做复杂处理
    });

    return () => {
      source.removeEventListener("task", handleTaskEvent);
      source.close();
    };
  }, [enabled, queryClient]);
}
