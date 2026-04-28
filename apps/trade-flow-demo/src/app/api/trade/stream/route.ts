import { subscribeOrderEvents } from "@/lib/trade/order-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function encodeSseMessage(params: { event?: string; data: unknown }) {
  const lines: string[] = [];

  if (params.event) {
    lines.push(`event: ${params.event}`);
  }

  lines.push(`data: ${JSON.stringify(params.data)}`);
  lines.push("");

  return lines.join("\n");
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          encodeSseMessage({
            event: "connected",
            data: {
              message: "SSE connected.",
              connectedAt: Date.now(),
            },
          }),
        ),
      );

      const unsubscribe = subscribeOrderEvents((event) => {
        controller.enqueue(
          encoder.encode(
            encodeSseMessage({
              event: event.type,
              data: event,
            }),
          ),
        );
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(
          encoder.encode(
            encodeSseMessage({
              event: "heartbeat",
              data: {
                now: Date.now(),
              },
            }),
          ),
        );
      }, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
