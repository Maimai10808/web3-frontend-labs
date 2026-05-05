"use client";

import type { GrowthTask } from "@/lib/campaign/types";

type TaskCardProps = {
  task: GrowthTask;
  isVerifying: boolean;
  onVerify: (task: GrowthTask) => void | Promise<void>;
};

export function TaskCard({ task, isVerifying, onVerify }: TaskCardProps) {
  const isVerified = task.status === "verified";
  const isFailed = task.status === "failed";

  return (
    <article className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">{task.title}</h3>
          <p className="mt-1 text-sm text-gray-400">{task.description}</p>
        </div>

        <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-100">
          {task.points} pts
        </div>
      </div>

      {task.href ? (
        <a
          href={task.href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm text-blue-300 underline"
        >
          Open task link
        </a>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <TaskStatusBadge status={task.status} />

        <button
          type="button"
          onClick={() => {
            void onVerify(task);
          }}
          disabled={isVerifying || isVerified}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isVerifying
            ? "Verifying..."
            : isVerified
              ? "Verified"
              : task.verifyLabel}
        </button>
      </div>

      {isFailed && task.errorMessage ? (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
          {task.errorMessage}
        </div>
      ) : null}
    </article>
  );
}

function TaskStatusBadge({ status }: { status: GrowthTask["status"] }) {
  const styles: Record<GrowthTask["status"], string> = {
    locked: "border-white/10 bg-white/5 text-gray-400",
    ready: "border-yellow-500/20 bg-yellow-500/10 text-yellow-100",
    verifying: "border-blue-500/20 bg-blue-500/10 text-blue-100",
    verified: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
    failed: "border-red-500/20 bg-red-500/10 text-red-100",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
