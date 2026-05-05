import { NextResponse } from "next/server";
import type { LeaderboardItem } from "@/lib/campaign/types";

function buildMockLeaderboard(): LeaderboardItem[] {
  const wallets = [
    "0x7Aa5ebB10DC797CAC828524e59A333d0A371443c",
    "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
    "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
    "0x9A676e781A523b5d0C0e43731313A708CB607508",
    "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
  ];

  return wallets.map((address, index) => {
    const seed = Number.parseInt(address.slice(2, 10), 16);
    const invitedCount = (seed % 12) + 1;
    const rewardMultiplier = Number((1 + ((seed % 5) + 1) * 0.05).toFixed(2));
    const points = invitedCount * 80 + (6 - index) * 95;

    return {
      rank: index + 1,
      address,
      displayName: `builder-${index + 1}`,
      points,
      invitedCount,
      rewardMultiplier,
    };
  });
}

export async function GET() {
  try {
    const items = buildMockLeaderboard().sort((a, b) => b.points - a.points);

    const ranked = items.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    return NextResponse.json({
      ok: true,
      result: ranked,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load leaderboard.",
      },
      { status: 500 },
    );
  }
}
