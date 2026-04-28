"use client";

import { useMemo } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  Activity,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  TableProperties,
  XCircle,
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
import { useOrderEvents, useOrders } from "@/hooks/trade";
import type { Order, OrderStatus } from "@/lib/trade/types";

type OrderTableProps = {
  account?: `0x${string}`;
};

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "accepted", "matched"];

export function OrderTable({ account }: OrderTableProps) {
  const ordersQuery = useOrders();

  useOrderEvents({
    enabled: true,
  });

  const orders = useMemo(() => {
    const currentOrders = ordersQuery.data?.orders ?? [];

    if (!account) {
      return currentOrders;
    }

    return currentOrders.filter(
      (order) => order.account.toLowerCase() === account.toLowerCase(),
    );
  }, [account, ordersQuery.data?.orders]);

  const summary = useMemo(() => {
    return {
      total: orders.length,
      active: orders.filter((order) => ACTIVE_STATUSES.includes(order.status))
        .length,
      filled: orders.filter((order) => order.status === "filled").length,
      terminal: orders.filter((order) =>
        ["filled", "cancelled", "expired", "rejected"].includes(order.status),
      ).length,
    };
  }, [orders]);

  return (
    <Card className="trade-panel overflow-hidden rounded-[2rem]">
      <CardHeader className="border-b border-[var(--line-soft)] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
            <TableProperties className="size-3.5" />
            Order Monitor
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Order Table
          </CardTitle>
          <CardDescription>
            Submission success only means the order was accepted by the backend.
            Final state continues to update from the order stream.
          </CardDescription>
        </div>

        <CardAction className="w-full sm:w-auto">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="trade-button-accent rounded-2xl px-4"
              onClick={() => {
                void ordersQuery.refetch();
              }}
              disabled={ordersQuery.isFetching}
            >
              <RefreshCw
                className={
                  ordersQuery.isFetching ? "size-4 animate-spin" : "size-4"
                }
              />
              Refresh
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard
            icon={<Activity className="size-4" />}
            label="Total Orders"
            value={summary.total}
          />
          <SummaryCard
            icon={<Clock3 className="size-4" />}
            label="Active"
            value={summary.active}
          />
          <SummaryCard
            icon={<CheckCircle2 className="size-4" />}
            label="Filled"
            value={summary.filled}
          />
          <SummaryCard
            icon={<ShieldAlert className="size-4" />}
            label="Terminal"
            value={summary.terminal}
          />
        </div>

        {ordersQuery.isError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {ordersQuery.error instanceof Error
              ? ordersQuery.error.message
              : "Failed to load orders."}
          </div>
        ) : null}

        {ordersQuery.isLoading ? (
          <div className="flex min-h-56 items-center justify-center rounded-3xl border border-dashed border-[var(--line-strong)] bg-white/48 p-6">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <LoaderCircle className="size-4 animate-spin" />
              Loading orders...
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--line-strong)] bg-white/48 p-6 text-center">
            <div className="mb-3 inline-flex rounded-2xl bg-amber-100/85 p-3 text-amber-700">
              <TableProperties className="size-5" />
            </div>
            <div className="text-base font-medium">No orders yet</div>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Submit a limit order from the ticket above. New orders will show
              up here first as pending and then continue changing through the
              mock backend lifecycle.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-white/62 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-[rgba(251,245,236,0.88)] text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Market</th>
                    <th className="px-4 py-3 font-medium">Side</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Filled</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Order Id</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-t border-[var(--line-soft)] transition-colors hover:bg-[rgba(255,248,240,0.72)]"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground">
                          {order.market}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {formatTimestamp(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <SideBadge side={order.side} />
                      </td>
                      <td className="px-4 py-4 font-medium">{order.amount}</td>
                      <td className="px-4 py-4">
                        ${formatNumeric(order.price)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {formatNumeric(order.filledAmount)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {getFillRatio(order)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-mono text-xs text-slate-500">
                          {truncateValue(order.orderId)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {formatDistanceToNowStrict(order.updatedAt, {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {formatTimestamp(order.updatedAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryCard(props: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="trade-soft-card rounded-[1.4rem] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        <span className="text-slate-700">{props.icon}</span>
        {props.label}
      </div>
      <div className="text-xl font-semibold text-slate-800">{props.value}</div>
    </div>
  );
}

function SideBadge({ side }: { side: Order["side"] }) {
  const className =
    side === "buy"
      ? "border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
      : "border-rose-500/25 bg-rose-500/12 text-rose-700 dark:text-rose-300";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {side}
    </span>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    pending:
      "border-amber-500/25 bg-amber-500/12 text-amber-700 dark:text-amber-300",
    accepted: "border-sky-500/25 bg-sky-500/12 text-sky-700 dark:text-sky-300",
    matched:
      "border-indigo-500/25 bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
    partially_filled:
      "border-violet-500/25 bg-violet-500/12 text-violet-700 dark:text-violet-300",
    filled:
      "border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    cancelled:
      "border-slate-500/25 bg-slate-500/12 text-slate-700 dark:text-slate-300",
    rejected:
      "border-rose-500/25 bg-rose-500/12 text-rose-700 dark:text-rose-300",
    expired:
      "border-orange-500/25 bg-orange-500/12 text-orange-700 dark:text-orange-300",
  };

  const icons: Record<OrderStatus, React.ReactNode> = {
    pending: <LoaderCircle className="size-3.5 animate-spin" />,
    accepted: <Activity className="size-3.5" />,
    matched: <Activity className="size-3.5" />,
    partially_filled: <Activity className="size-3.5" />,
    filled: <CheckCircle2 className="size-3.5" />,
    cancelled: <XCircle className="size-3.5" />,
    rejected: <ShieldAlert className="size-3.5" />,
    expired: <Clock3 className="size-3.5" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${styles[status]}`}
    >
      {icons[status]}
      {status.replace("_", " ")}
    </span>
  );
}

function truncateValue(value: string) {
  return `${value.slice(0, 12)}...${value.slice(-6)}`;
}

function formatNumeric(value: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return numericValue.toLocaleString("en-US", {
    maximumFractionDigits: 4,
  });
}

function formatTimestamp(value: number) {
  return format(value, "MMM d, HH:mm:ss");
}

function getFillRatio(order: Order) {
  const amount = Number(order.amount);
  const filledAmount = Number(order.filledAmount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isFinite(filledAmount)
  ) {
    return "0% filled";
  }

  return `${Math.min((filledAmount / amount) * 100, 100).toFixed(0)}% filled`;
}
