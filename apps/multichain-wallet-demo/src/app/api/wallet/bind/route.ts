import { NextRequest, NextResponse } from "next/server";

type BindBody = {
  ecosystem: string;
  address: string;
  signature: string;
  nonce: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as BindBody;

  if (!body.address || !body.signature || !body.nonce) {
    return NextResponse.json(
      { ok: false, message: "Missing required fields" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    binding: {
      ecosystem: body.ecosystem,
      address: body.address,
      nonce: body.nonce,
      verifiedAt: new Date().toISOString(),
      verificationMode: "mock-demo",
    },
  });
}
