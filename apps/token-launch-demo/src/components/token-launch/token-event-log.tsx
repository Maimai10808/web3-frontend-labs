"use client";

import type { TokenLaunchEvent } from "@/lib/token-launch/types";

export type TokenLaunchLogEntry = TokenLaunchEvent & {
  id: string;
  createdAt: string;
};

type TokenEventLogProps = {
  entries: TokenLaunchLogEntry[];
};

export function TokenEventLog({ entries }: TokenEventLogProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h3 className="mb-3 text-base font-semibold text-white">Event Log</h3>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          No events yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-white/10 bg-gray-950 p-3"
            >
              <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                {entry.type}
              </div>
              <div className="mb-1 text-sm text-white">{entry.message}</div>
              <div className="text-xs text-gray-500">{entry.createdAt}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
