import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateEligibility } from "@/lib/campaign/calculate-eligibility";
import {
  AIRDROP_GROWTH_CLAIM_DEADLINE,
  AIRDROP_GROWTH_POINTS_THRESHOLD,
} from "@/lib/campaign/constants";

const taskStatusSchema = z.enum([
  "locked",
  "ready",
  "verifying",
  "verified",
  "failed",
]);

const taskTypeSchema = z.enum([
  "follow",
  "join",
  "connect_wallet",
  "sign_message",
  "visit_website",
]);

const taskVerifyModeSchema = z.enum([
  "mock_api",
  "frontend_wallet",
  "wallet_signature",
]);

const growthTaskSchema = z.object({
  id: z.string().trim().min(1),
  type: taskTypeSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  points: z.number().int().nonnegative(),
  status: taskStatusSchema,
  verifyLabel: z.string().trim().min(1),
  verifyMode: taskVerifyModeSchema,
  href: z.string().trim().optional(),
  errorMessage: z.string().trim().optional(),
  verifiedAt: z.number().optional(),
});

const claimStatusRequestSchema = z.object({
  tasks: z.array(growthTaskSchema),
  hasClaimed: z.boolean().optional(),
  claimDeadline: z.number().optional(),
  pointsThreshold: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = claimStatusRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid claim status payload.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = calculateEligibility({
      tasks: parsed.data.tasks,
      hasClaimed: parsed.data.hasClaimed ?? false,
      claimDeadline: parsed.data.claimDeadline ?? AIRDROP_GROWTH_CLAIM_DEADLINE,
      pointsThreshold:
        parsed.data.pointsThreshold ?? AIRDROP_GROWTH_POINTS_THRESHOLD,
    });

    return NextResponse.json({
      ok: true,
      result: {
        claimStatus: result.claimStatus,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to calculate claim status.",
      },
      { status: 500 },
    );
  }
}
