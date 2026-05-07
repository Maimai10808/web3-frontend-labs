"use client";

import type { TaskStatus } from "@/types/task";

type TaskStatusBadgeProps = {
  status: TaskStatus;
};

const statusConfig: Record<
  TaskStatus,
  {
    label: string;
    className: string;
  }
> = {
  queued: {
    label: "Queued",
    className: "border-zinc-200 bg-zinc-100 text-zinc-700",
  },
  processing: {
    label: "Processing",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  succeeded: {
    label: "Succeeded",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  failed: {
    label: "Failed",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-zinc-200 bg-zinc-100 text-zinc-600",
  },
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
