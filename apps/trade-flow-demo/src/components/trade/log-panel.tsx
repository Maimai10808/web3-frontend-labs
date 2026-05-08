"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  FileJson2,
  ListTree,
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

const MAX_VISIBLE_ENTRIES = 6;

type PanelMode = "terminal" | "events";

export function LogPanel() {
  return <TerminalPanel />;
}

export function TerminalPanel() {
  return <TradeActivityPanel mode="terminal" />;
}

export function EventsPanel() {
  return <TradeActivityPanel mode="events" />;
}

function TradeActivityPanel({ mode }: { mode: PanelMode }) {
  const snapshot = useTradeLogStore((state) => state.snapshot);
  const entries = useTradeLogStore((state) => state.entries);
  const clear = useTradeLogStore((state) => state.clear);

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) =>
        mode === "terminal" ? entry.section !== "orderEvent" : entry.section === "orderEvent",
      )
      .slice(0, MAX_VISIBLE_ENTRIES);
  }, [entries, mode]);

  const panelCopy =
    mode === "terminal"
      ? {
          eyebrow: "Execution Logs",
          title: "Terminal",
          description: "Trade execution logs and status output.",
          emptyTitle: "No terminal output yet",
          emptySubtitle: "Signed submissions and execution outputs will appear here.",
        }
      : {
          eyebrow: "Contract Events",
          title: "Events",
          description: "On-chain order events captured from TradeOrderBook.",
          emptyTitle: "No contract events captured yet",
          emptySubtitle: "OrderSubmitted and subsequent order updates will appear here.",
        };

  return (
    <Card className="min-h-48 overflow-hidden rounded-xl border bg-card shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {mode === "terminal" ? (
              <ReceiptText className="size-3.5" />
            ) : (
              <ListTree className="size-3.5" />
            )}
            {panelCopy.eyebrow}
          </div>
          <CardTitle className="text-base font-semibold text-foreground">
            {panelCopy.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {panelCopy.description}
          </CardDescription>
        </div>

        <CardAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="px-4"
            onClick={clear}
            disabled={entries.length === 0}
          >
            <RefreshCcw className="size-4" />
            Clear
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex min-h-[340px] flex-col gap-4 pt-5">
        {mode === "terminal" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Entries" value={filteredEntries.length} />
            <StatCard
              label="Last Result"
              value={snapshot.submitResponse?.status ?? "idle"}
            />
            <StatCard
              label="Last Error"
              value={snapshot.errorMessage ? "present" : "none"}
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Captured" value={filteredEntries.length} />
            <StatCard
              label="Last Event"
              value={snapshot.latestOrderEvent?.type ?? "waiting"}
            />
            <StatCard
              label="Last Order"
              value={
                snapshot.latestOrderEvent?.order?.orderId
                  ? truncateValue(snapshot.latestOrderEvent.order.orderId)
                  : "-"
              }
            />
          </div>
        )}

        {mode === "terminal" && snapshot.errorMessage ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2 font-medium">
              <ShieldAlert className="size-4" />
              Last error
            </div>
            <p className="mt-2 leading-6">{snapshot.errorMessage}</p>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Waves className="size-4 text-primary" />
            Recent Feed
          </div>

          {filteredEntries.length === 0 ? (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/50 p-6 text-center">
              <div className="space-y-2">
                <div className="mx-auto inline-flex rounded-md bg-background p-3 text-muted-foreground">
                  <FileJson2 className="size-5" />
                </div>
                <div className="text-sm font-medium text-foreground">
                  {panelCopy.emptyTitle}
                </div>
                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                  {panelCopy.emptySubtitle}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto rounded-lg bg-muted/50 p-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="mb-2 rounded-md border bg-background p-3 last:mb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {entry.section}
                      </div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {entry.title}
                      </div>
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {format(entry.createdAt, "HH:mm:ss")}
                    </div>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      View payload
                    </summary>
                    <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-5 text-foreground">
                      <code>{JSON.stringify(entry.payload, null, 2)}</code>
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard(props: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {props.label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-foreground">
        {props.value}
      </div>
    </div>
  );
}

function truncateValue(value: string) {
  if (value.length <= 20) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}
