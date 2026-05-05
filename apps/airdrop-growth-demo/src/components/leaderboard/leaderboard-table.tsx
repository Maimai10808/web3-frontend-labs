"use client";

import type { LeaderboardItem } from "@/lib/campaign/types";

type LeaderboardTableProps = {
  items: LeaderboardItem[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

export function LeaderboardTable({
  items,
  isLoading = false,
  errorMessage = null,
}: LeaderboardTableProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
      <p className="mt-1 text-sm text-gray-400">
        Top campaign participants ranked by growth points.
      </p>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-gray-950 p-4 text-sm text-gray-300">
          Loading leaderboard...
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage && items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-gray-950 p-4 text-sm text-gray-400">
          No leaderboard data available.
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Wallet</th>
                <th className="px-3 py-2">Points</th>
                <th className="px-3 py-2">Invites</th>
                <th className="px-3 py-2">Multiplier</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.address}
                  className="rounded-xl border border-white/10 bg-gray-950 text-sm text-white"
                >
                  <td className="px-3 py-3">{item.rank}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium">
                      {item.displayName ?? "anonymous"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {shortenAddress(item.address)}
                    </div>
                  </td>
                  <td className="px-3 py-3">{item.points}</td>
                  <td className="px-3 py-3">{item.invitedCount}</td>
                  <td className="px-3 py-3">{item.rewardMultiplier}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function shortenAddress(address: string) {
  if (address.length < 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
