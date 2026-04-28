"use client";

import { format } from "date-fns";
import {
  FileJson2,
  ReceiptText,
  RefreshCcw,
  ShieldAlert,
  Waves,
} from "lucide-react";

import { Button } from "@web3-frontend-labs/ui";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@web3-frontend-labs/ui";
import { useTradeLogStore } from "@/hooks/trade";

export function LogPanel() {
  const snapshot = useTradeLogStore((state) => state.snapshot);
  const entries = useTradeLogStore((state) => state.entries);
  const clear = useTradeLogStore((state) => state.clear);

  return (
    <Card className="trade-panel overflow-hidden rounded-[2rem]">
      <CardHeader className="border-b border-[var(--line-soft)] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <ReceiptText className="size-3.5" />
            Activity Logs
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Log Panel
          </CardTitle>
          <CardDescription>
            Inspect each step in the flow: validated form input, encoded trade
            data, operation, signing payload, signature, submit response, and
            real-time order events.
          </CardDescription>
        </div>

        <CardAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="trade-button-secondary rounded-2xl px-4"
            onClick={clear}
            disabled={entries.length === 0}
          >
            <RefreshCcw className="size-4" />
            Clear
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Entries" value={entries.length} />
          <StatCard
            label="Last Event"
            value={snapshot.latestOrderEvent?.type ?? "waiting"}
          />
          <StatCard
            label="Last Result"
            value={snapshot.submitResponse?.status ?? "idle"}
          />
        </div>

        {snapshot.errorMessage ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2 font-medium">
              <ShieldAlert className="size-4" />
              Last error
            </div>
            <p className="mt-2 leading-6">{snapshot.errorMessage}</p>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <LogBlock
            title="Encoded Trade Data"
            payload={snapshot.tradeData}
            emptyText="No trade data encoded yet."
          />
          <LogBlock
            title="Operation"
            payload={snapshot.operation}
            emptyText="No operation built yet."
          />
          <LogBlock
            title="Signing Payload"
            payload={snapshot.signingPayload}
            emptyText="No signing payload generated yet."
          />
          <LogBlock
            title="Submit Response"
            payload={snapshot.submitResponse}
            emptyText="No submit response yet."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Waves className="size-4 text-emerald-600" />
            Event Timeline
          </div>

          {entries.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--line-strong)] bg-white/48 p-6 text-center">
              <div className="mb-3 inline-flex rounded-2xl bg-emerald-100/80 p-3 text-emerald-700">
                <FileJson2 className="size-5" />
              </div>
              <div className="text-base font-medium">No logs yet</div>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Submit a trade or wait for an order event. The latest activity
                will appear here as structured logs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="trade-soft-card rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{entry.title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {entry.section}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {format(entry.createdAt, "HH:mm:ss")}
                    </div>
                  </div>
                  <pre className="trade-muted-block mt-3 overflow-x-auto rounded-2xl p-3 text-xs leading-6 text-foreground">
                    <code>{JSON.stringify(entry.payload, null, 2)}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LogBlock(props: {
  title: string;
  payload: unknown;
  emptyText: string;
}) {
  return (
    <div className="trade-soft-card rounded-3xl p-4">
      <div className="mb-3 text-sm font-semibold">{props.title}</div>
      {props.payload ? (
        <pre className="trade-muted-block overflow-x-auto rounded-2xl p-3 text-xs leading-6 text-foreground">
          <code>{JSON.stringify(props.payload, null, 2)}</code>
        </pre>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-white/48 p-4 text-sm text-slate-600">
          {props.emptyText}
        </div>
      )}
    </div>
  );
}

function StatCard(props: { label: string; value: string | number }) {
  return (
    <div className="trade-soft-card rounded-2xl p-4">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {props.label}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-800">
        {props.value}
      </div>
    </div>
  );
}
