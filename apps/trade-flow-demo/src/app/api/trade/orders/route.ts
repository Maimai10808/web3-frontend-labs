import { NextResponse } from "next/server";
import { listOrders } from "@/lib/trade/order-store";

export async function GET() {
  try {
    const orders = listOrders();

    return NextResponse.json({
      orders,
      total: orders.length,
      receivedAt: Date.now(),
    });
  } catch (error) {
    console.error("[trade/orders] error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch orders.",
      },
      { status: 500 },
    );
  }
}
