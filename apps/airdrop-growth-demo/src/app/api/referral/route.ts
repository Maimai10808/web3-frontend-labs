import { NextResponse } from "next/server";
import { z } from "zod";

const referralRequestSchema = z.object({
  address: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/),
  referralLink: z.string().trim().url(),
});

function buildMockReferralStats(address: string, referralLink: string) {
  const seed = Number.parseInt(address.slice(2, 10), 16);

  const invitedCount = (seed % 8) + 1;
  const referralPoints = invitedCount * 75;
  const rewardMultiplier = 1 + ((seed % 4) + 1) * 0.05;

  return {
    address,
    referralCode: address,
    referralLink,
    invitedCount,
    referralPoints,
    rewardMultiplier: Number(rewardMultiplier.toFixed(2)),
  };
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = referralRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid referral payload.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = buildMockReferralStats(
      parsed.data.address,
      parsed.data.referralLink,
    );

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load referral stats.",
      },
      { status: 500 },
    );
  }
}
