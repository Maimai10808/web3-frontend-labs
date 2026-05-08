import { getServerSession } from "next-auth";
import { z } from "zod";
import { isAddress, isAddressEqual, recoverTypedDataAddress } from "viem";
import { authOptions } from "@/src/lib/auth";
import {
  expectedOrderChainId,
  expectedOrderTokenAddress,
  getSignedOrderBookDomain,
  isAllowedOrderToken,
} from "@/src/lib/eip712/domain";
import {
  signedOrderInputSchema,
  signedOrderTypes,
  toSignedOrderTypedData,
} from "@/src/lib/eip712/order";
import { consumeSignedOrderNonce } from "@/src/lib/eip712/nonce";

const verifyOrderRequestSchema = z.object({
  chainId: z.number().int().positive(),
  order: signedOrderInputSchema,
  signature: z.custom<`0x${string}`>(
    (value) => typeof value === "string" && /^0x[a-fA-F0-9]{130}$/.test(value),
    "Signature must be a valid 65-byte hex string.",
  ),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name || !isAddress(session.user.name)) {
      return Response.json(
        {
          ok: false,
          error: "UNAUTHORIZED",
          message: "Session is missing or expired.",
        },
        { status: 401 },
      );
    }

    const rawBody = await request.json();
    const parsedRequest = verifyOrderRequestSchema.safeParse(rawBody);

    if (!parsedRequest.success) {
      return Response.json(
        {
          ok: false,
          error: "INVALID_REQUEST",
          issues: parsedRequest.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { chainId, order, signature } = parsedRequest.data;

    if (chainId !== expectedOrderChainId) {
      return Response.json(
        {
          ok: false,
          error: "CHAIN_MISMATCH",
          message: `Expected chain ${expectedOrderChainId}, received ${chainId}.`,
        },
        { status: 400 },
      );
    }

    if (!isAllowedOrderToken(order.token)) {
      return Response.json(
        {
          ok: false,
          error: "INVALID_TOKEN",
          message: "Order token is not in the allowed list.",
          expectedToken: expectedOrderTokenAddress,
        },
        { status: 400 },
      );
    }

    const typedOrder = toSignedOrderTypedData(order);
    const recoveredAddress = await recoverTypedDataAddress({
      domain: getSignedOrderBookDomain(),
      types: signedOrderTypes,
      primaryType: "Order",
      message: typedOrder,
      signature,
    });

    const sessionAddress = session.user.name as `0x${string}`;
    const signerMatchesMaker = isAddressEqual(recoveredAddress, order.maker);
    const sessionMatchesMaker = isAddressEqual(sessionAddress, order.maker);

    if (!signerMatchesMaker) {
      return Response.json(
        {
          ok: false,
          error: "SIGNER_MISMATCH",
          message: "Recovered signer does not match order.maker.",
          recoveredAddress,
          orderMaker: order.maker,
        },
        { status: 403 },
      );
    }

    if (!sessionMatchesMaker) {
      return Response.json(
        {
          ok: false,
          error: "SESSION_MISMATCH",
          message: "Session address does not match order.maker.",
          sessionAddress,
          orderMaker: order.maker,
        },
        { status: 403 },
      );
    }

    const now = BigInt(Math.floor(Date.now() / 1000));

    if (BigInt(order.deadline) < now) {
      return Response.json(
        {
          ok: false,
          error: "ORDER_EXPIRED",
          message: "Order deadline has expired.",
        },
        { status: 400 },
      );
    }

    const nonceResult = consumeSignedOrderNonce({
      address: sessionAddress,
      nonce: order.nonce,
    });

    if (!nonceResult.ok) {
      return Response.json(
        {
          ok: false,
          error: nonceResult.error,
          message: nonceResult.message,
        },
        { status: 400 },
      );
    }

    return Response.json({
      ok: true,
      verified: true,
      sessionAddress,
      recoveredAddress,
      order,
      expectedToken: expectedOrderTokenAddress,
      expectedChainId: expectedOrderChainId,
    });
  } catch (error) {
    console.error("Signed order verify error:", error);

    return Response.json(
      {
        ok: false,
        error: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
