/* eslint-disable @next/next/no-img-element */
"use client";

import type { Task } from "@/types/task";
import { TaskActions, type PendingTaskAction } from "./task-actions";
import { TaskProgress } from "./task-progress";
import { TaskStatusBadge } from "./task-status-badge";

type TaskCardProps = {
  task: Task;
  pendingAction: PendingTaskAction;
  isCancellingTask?: boolean;
  isRetryingTask?: boolean;
  onCancelTask: (taskId: string) => Promise<void>;
  onRetryTask: (taskId: string) => Promise<void>;
};

export function TaskCard({
  task,
  pendingAction,
  isCancellingTask = false,
  isRetryingTask = false,
  onCancelTask,
  onRetryTask,
}: TaskCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {task.id}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatDate(task.createdAt)} · {task.type}
          </p>
        </div>
        <TaskStatusBadge status={task.status} />
      </header>

      <div className="mt-3 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Prompt
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-800">
            {task.prompt}
          </p>
        </div>

        {task.type === "image-to-image" ? (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Source Image
            </p>
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
              <img
                src={task.sourceImage.previewUrl}
                alt={task.sourceImage.name}
                className="h-40 w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <TaskProgress progress={task.progress} status={task.status} />

        {task.retryOfTaskId ? (
          <p className="text-xs text-zinc-500">
            Retry of: {task.retryOfTaskId}
          </p>
        ) : null}

        {task.status === "failed" && task.errorMessage ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {task.errorMessage}
          </p>
        ) : null}

        {task.status === "succeeded" && task.resultImageUrl ? (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Result Preview
            </p>
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
              <img
                src={task.resultImageUrl}
                alt={`Result of ${task.id}`}
                className="h-40 w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <TaskActions
          task={task}
          pendingAction={pendingAction}
          isCancellingTask={isCancellingTask}
          isRetryingTask={isRetryingTask}
          onCancelTask={onCancelTask}
          onRetryTask={onRetryTask}
        />
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
