import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildReferralStats,
  recordReferralVisit,
} from "@/lib/referral/mock-referral-store";

const referralRequestSchema = z.object({
  address: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/),
  referralLink: z.string().trim().url(),
});

const referralTrackRequestSchema = z.object({
  inviter: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/),
  refereeId: z.string().trim().min(1),
});

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

    const result = buildReferralStats({
      address: parsed.data.address,
      referralLink: parsed.data.referralLink,
    });

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

export async function PUT(request: Request) {
  try {
    const json = await request.json();
    const parsed = referralTrackRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid referral tracking payload.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = recordReferralVisit(parsed.data);

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
            : "Failed to record referral visit.",
      },
      { status: 500 },
    );
  }
}
