import { taskEventBus } from "@/lib/task-events";

function encodeSseMessage(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      controller.enqueue(
        encoder.encode(
          encodeSseMessage("ready", {
            connectedAt: new Date().toISOString(),
          }),
        ),
      );

      const unsubscribe = taskEventBus.subscribe((event) => {
        controller.enqueue(encoder.encode(encodeSseMessage("task", event)));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(
          encoder.encode(
            encodeSseMessage("heartbeat", {
              timestamp: new Date().toISOString(),
            }),
          ),
        );
      }, 15_000);

      const close = () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      };

      // @ts-expect-error Next/edge stream close callback pattern
      controller._close = close;
    },

    cancel() {
      // no-op, cleanup is handled by runtime closing the stream
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
