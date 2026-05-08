import { getServerSession } from "next-auth";
import { isAddress, isAddressEqual, recoverTypedDataAddress } from "viem";
import { authOptions } from "@/src/lib/auth";
import {
  getOrderDomain,
  orderInputSchema,
  orderTypes,
  toOrderTypedData,
} from "@/src/lib/eip712";
import { consumeOrderNonce } from "@/src/lib/order-nonce-store";

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

    const body = await request.json();

    const parsedOrder = orderInputSchema.safeParse(body.order);

    if (!parsedOrder.success) {
      return Response.json(
        {
          ok: false,
          error: "INVALID_ORDER",
          issues: parsedOrder.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (
      typeof body.signature !== "string" ||
      !/^0x[a-fA-F0-9]{130}$/.test(body.signature)
    ) {
      return Response.json(
        {
          ok: false,
          error: "INVALID_SIGNATURE",
          message: "Signature must be a valid 65-byte hex string.",
        },
        { status: 400 },
      );
    }

    if (typeof body.chainId !== "number") {
      return Response.json(
        {
          ok: false,
          error: "INVALID_CHAIN_ID",
          message: "chainId is required.",
        },
        { status: 400 },
      );
    }

    const orderInput = parsedOrder.data;
    const typedOrder = toOrderTypedData(orderInput);

    const recoveredAddress = await recoverTypedDataAddress({
      domain: getOrderDomain(body.chainId),
      types: orderTypes,
      primaryType: "Order",
      message: typedOrder,
      signature: body.signature as `0x${string}`,
    });

    const sessionAddress = session.user.name as `0x${string}`;
    const orderMaker = typedOrder.maker;

    const signerMatchesSession = isAddressEqual(
      recoveredAddress,
      sessionAddress,
    );

    const makerMatchesSession = isAddressEqual(orderMaker, sessionAddress);

    if (!signerMatchesSession || !makerMatchesSession) {
      return Response.json(
        {
          ok: false,
          error: "ADDRESS_MISMATCH",
          sessionAddress,
          recoveredAddress,
          orderMaker,
        },
        { status: 403 },
      );
    }

    const now = Math.floor(Date.now() / 1000);

    if (Number(orderInput.deadline) < now) {
      return Response.json(
        {
          ok: false,
          error: "ORDER_EXPIRED",
          message: "Order deadline has expired.",
        },
        { status: 400 },
      );
    }

    const nonceResult = consumeOrderNonce({
      address: sessionAddress,
      nonce: orderInput.nonce,
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
      order: orderInput,
    });
  } catch (error) {
    console.error("Order verify error:", error);

    return Response.json(
      {
        ok: false,
        error: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
