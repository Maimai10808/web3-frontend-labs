import { NextResponse } from "next/server";
import type { Address, Hex } from "viem";
import { z } from "zod";
import { verifyTaskMock } from "@/lib/tasks/verify-task-mock";

const verifyTaskRequestSchema = z.object({
  taskId: z.string().trim().min(1),
  taskType: z.enum([
    "follow",
    "join",
    "connect_wallet",
    "sign_message",
    "visit_website",
  ]),
  walletAddress: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address.")
    .transform((value) => value as Address)
    .optional(),
  signature: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]+$/, "Invalid signature.")
    .transform((value) => value as Hex)
    .optional(),
  message: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = verifyTaskRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid task verification payload.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await verifyTaskMock(parsed.data);

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Task verification failed.",
      },
      { status: 500 },
    );
  }
}
