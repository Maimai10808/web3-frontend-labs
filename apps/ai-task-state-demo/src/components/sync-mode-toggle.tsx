"use client";

import type { TaskSyncMode } from "@/types/task";

type SyncModeToggleProps = {
  value: TaskSyncMode;
  onChange: (nextMode: TaskSyncMode) => void;
  disabled?: boolean;
};

const syncModeOptions: Array<{
  value: TaskSyncMode;
  label: string;
  hint: string;
}> = [
  {
    value: "sse",
    label: "SSE",
    hint: "实时推送更新",
  },
  {
    value: "polling",
    label: "Polling",
    hint: "定时拉取更新",
  },
];

export function SyncModeToggle({
  value,
  onChange,
  disabled = false,
}: SyncModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1">
      {syncModeOptions.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            title={option.hint}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
