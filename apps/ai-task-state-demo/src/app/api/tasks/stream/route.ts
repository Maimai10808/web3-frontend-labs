import { taskEventBus } from "@/lib/task-events";

function encodeSseMessage(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  let cleanupStream = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let cleanedUp = false;
      let heartbeat: ReturnType<typeof setInterval> | null = null;
      let unsubscribe: (() => void) | null = null;

      const cleanup = () => {
        if (cleanedUp) {
          return;
        }

        cleanedUp = true;

        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = null;
        }

        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      };

      const safeEnqueue = (event: string, data: unknown) => {
        if (cleanedUp || request.signal.aborted) {
          return false;
        }

        try {
          controller.enqueue(encoder.encode(encodeSseMessage(event, data)));
          return true;
        } catch {
          cleanup();
          return false;
        }
      };

      cleanupStream = cleanup;
      request.signal.addEventListener("abort", cleanup, { once: true });

      safeEnqueue("ready", {
        connectedAt: new Date().toISOString(),
      });

      unsubscribe = taskEventBus.subscribe((event) => {
        safeEnqueue("task", event);
      });

      heartbeat = setInterval(() => {
        safeEnqueue("heartbeat", {
          timestamp: new Date().toISOString(),
        });
      }, 15_000);
    },

    cancel() {
      cleanupStream();
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
