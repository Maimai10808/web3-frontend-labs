import { NextResponse } from "next/server";

export async function GET() {
  const nonce = crypto.randomUUID();

  return NextResponse.json({
    nonce,
    issuedAt: new Date().toISOString(),
    message: `Bind wallet with nonce: ${nonce}`,
  });
}
