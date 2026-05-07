"use client";

import type { TaskStatus } from "@/types/task";

type TaskProgressProps = {
  progress: number;
  status: TaskStatus;
};

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function TaskProgress({ progress, status }: TaskProgressProps) {
  const normalized = clampProgress(progress);

  const barColorClass =
    status === "failed"
      ? "bg-rose-500"
      : status === "succeeded"
        ? "bg-emerald-500"
        : status === "cancelled"
          ? "bg-zinc-400"
          : "bg-blue-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Progress</span>
        <span>{normalized}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
        <div
          className={`h-full transition-all duration-300 ${barColorClass}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
