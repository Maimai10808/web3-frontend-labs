import { getServerSession } from "next-auth";
import { isAddress } from "viem";
import { authOptions } from "@/src/lib/auth";
import { createOrderNonce } from "@/src/lib/order-nonce-store";

export async function POST() {
  const session = await getServerSession(authOptions);

  const sessionAddress = session?.user?.name;

  if (!sessionAddress || !isAddress(sessionAddress)) {
    return Response.json(
      {
        ok: false,
        error: "UNAUTHORIZED",
        message: "Session is missing or invalid.",
      },
      { status: 401 },
    );
  }

  const nonce = createOrderNonce(sessionAddress);

  return Response.json({
    ok: true,
    nonce: nonce.nonce,
    expiresAt: nonce.expiresAt,
  });
}
