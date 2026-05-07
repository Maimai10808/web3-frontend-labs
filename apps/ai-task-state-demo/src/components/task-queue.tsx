"use client";

import type { Task } from "@/types/task";
import { EmptyState } from "./empty-state";
import { TaskCard } from "./task-card";
import type { PendingTaskAction } from "./task-actions";

type TaskQueueProps = {
  tasks: Task[];
  isLoading: boolean;
  isRefreshing?: boolean;
  error: unknown;
  pendingAction: PendingTaskAction;
  isCancellingTask?: boolean;
  isRetryingTask?: boolean;
  actionError?: string | null;
  onRefresh: () => void;
  onCancelTask: (taskId: string) => Promise<void>;
  onRetryTask: (taskId: string) => Promise<void>;
};

export function TaskQueue({
  tasks,
  isLoading,
  isRefreshing = false,
  error,
  pendingAction,
  isCancellingTask = false,
  isRetryingTask = false,
  actionError = null,
  onRefresh,
  onCancelTask,
  onRetryTask,
}: TaskQueueProps) {
  const queryErrorMessage =
    error instanceof Error ? error.message : "Failed to load tasks.";

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Task Queue</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} in queue
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex h-9 items-center rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error ? (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {queryErrorMessage}
        </p>
      ) : null}

      {actionError ? (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </p>
      ) : null}

      {isLoading && tasks.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-500">
          Loading tasks...
        </div>
      ) : null}

      {!isLoading && tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create your first task from the panel above."
        />
      ) : null}

      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              pendingAction={pendingAction}
              isCancellingTask={isCancellingTask}
              isRetryingTask={isRetryingTask}
              onCancelTask={onCancelTask}
              onRetryTask={onRetryTask}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
