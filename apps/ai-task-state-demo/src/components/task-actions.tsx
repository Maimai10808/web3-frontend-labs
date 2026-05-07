"use client";

import { taskCanCancel, taskCanRetry, type Task } from "@/types/task";

export type PendingTaskAction = {
  taskId: string;
  type: "cancel" | "retry";
} | null;

type TaskActionsProps = {
  task: Task;
  pendingAction: PendingTaskAction;
  isCancellingTask?: boolean;
  isRetryingTask?: boolean;
  onCancelTask: (taskId: string) => Promise<void>;
  onRetryTask: (taskId: string) => Promise<void>;
};

export function TaskActions({
  task,
  pendingAction,
  isCancellingTask = false,
  isRetryingTask = false,
  onCancelTask,
  onRetryTask,
}: TaskActionsProps) {
  const isCancellingCurrentTask =
    isCancellingTask &&
    pendingAction?.type === "cancel" &&
    pendingAction.taskId === task.id;

  const isRetryingCurrentTask =
    isRetryingTask &&
    pendingAction?.type === "retry" &&
    pendingAction.taskId === task.id;

  const disableAllButtons = Boolean(
    pendingAction || isCancellingTask || isRetryingTask,
  );

  return (
    <div className="flex items-center gap-2">
      {taskCanCancel(task) ? (
        <button
          type="button"
          disabled={disableAllButtons}
          onClick={() => {
            void onCancelTask(task.id);
          }}
          className="inline-flex h-8 items-center rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCancellingCurrentTask ? "Cancelling..." : "Cancel"}
        </button>
      ) : null}

      {taskCanRetry(task) ? (
        <button
          type="button"
          disabled={disableAllButtons}
          onClick={() => {
            void onRetryTask(task.id);
          }}
          className="inline-flex h-8 items-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRetryingCurrentTask ? "Retrying..." : "Retry"}
        </button>
      ) : null}
    </div>
  );
}
