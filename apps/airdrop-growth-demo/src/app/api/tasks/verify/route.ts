import { NextResponse } from "next/server";
import { isAddress, type Address, type Hex } from "viem";
import { z } from "zod";
import { verifyTaskMock } from "@/lib/tasks/verify-task-mock";

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const optionalAddress = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .refine((value) => isAddress(value), "Invalid wallet address.")
    .transform((value) => value as Address)
    .optional(),
);

const optionalHex = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .regex(/^0x[0-9a-fA-F]*$/, "Invalid hex signature.")
    .transform((value) => value as Hex)
    .optional(),
);

const optionalTrimmedString = z.preprocess(
  emptyStringToUndefined,
  z.string().optional(),
);

const verifyTaskRequestSchema = z.object({
  taskId: z.string().trim().min(1),
  taskType: z.enum([
    "follow",
    "join",
    "connect_wallet",
    "sign_message",
    "visit_website",
  ]),
  walletAddress: optionalAddress,
  signature: optionalHex,
  message: optionalTrimmedString,
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
