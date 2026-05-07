"use client";

import type { TaskSyncMode } from "@/types/task";
import { SyncModeToggle } from "./sync-mode-toggle";

type AppHeaderProps = {
  syncMode: TaskSyncMode;
  onSyncModeChange: (nextMode: TaskSyncMode) => void;
  totalTasks: number;
  activeTasks: number;
  succeededTasks: number;
  failedTasks: number;
  cancelledTasks: number;
};

export function AppHeader({
  syncMode,
  onSyncModeChange,
  totalTasks,
  activeTasks,
  succeededTasks,
  failedTasks,
  cancelledTasks,
}: AppHeaderProps) {
  return (
    <header className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            AI Task State Demo
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Create text/image tasks, observe progress, and manage retry/cancel
            actions.
          </p>
        </div>

        <div className="flex flex-col items-start gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Sync Mode
          </span>
          <SyncModeToggle value={syncMode} onChange={onSyncModeChange} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total" value={totalTasks} />
        <Stat label="Active" value={activeTasks} />
        <Stat label="Succeeded" value={succeededTasks} />
        <Stat label="Failed" value={failedTasks} />
        <Stat label="Cancelled" value={cancelledTasks} />
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
