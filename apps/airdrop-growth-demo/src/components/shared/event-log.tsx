"use client";

import type { GrowthEventLogEntry } from "@/lib/campaign/types";

type EventLogProps = {
  entries: GrowthEventLogEntry[];
};

export function EventLog({ entries }: EventLogProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Event Log</h2>
      <p className="mt-1 text-sm text-gray-400">
        Track task verification, eligibility changes, and reward claim activity.
      </p>

      {entries.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          No events yet.
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-white/10 bg-gray-950 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                    {entry.type}
                  </div>
                  <div className="text-sm text-white">{entry.message}</div>
                </div>

                <span
                  className={`rounded-full border px-2 py-1 text-xs ${getTone(entry.type)}`}
                >
                  {getBadge(entry.type)}
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                {entry.createdAt}
              </div>

              {"txHash" in entry && entry.txHash ? (
                <div className="mt-2 break-all text-xs text-blue-300">
                  {entry.txHash}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function getBadge(type: GrowthEventLogEntry["type"]) {
  if (type.includes("failed")) {
    return "error";
  }

  if (type.includes("confirmed") || type.includes("verified")) {
    return "success";
  }

  return "info";
}

function getTone(type: GrowthEventLogEntry["type"]) {
  if (type.includes("failed")) {
    return "border-red-500/20 bg-red-500/10 text-red-100";
  }

  if (type.includes("confirmed") || type.includes("verified")) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
  }

  return "border-blue-500/20 bg-blue-500/10 text-blue-100";
}
