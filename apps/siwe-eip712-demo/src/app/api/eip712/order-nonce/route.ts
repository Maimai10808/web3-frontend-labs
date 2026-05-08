import { getServerSession } from "next-auth";
import { isAddress } from "viem";
import { authOptions } from "@/src/lib/auth";
import { createSignedOrderNonce } from "@/src/lib/eip712/nonce";

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

  const nonce = createSignedOrderNonce(sessionAddress);

  return Response.json({
    ok: true,
    nonce: nonce.nonce,
    expiresAt: nonce.expiresAt,
  });
}
