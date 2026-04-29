"use client";

import { useMemo } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { useAccount } from "wagmi";
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
  const wallet = useAccount();
  const ordersQuery = useOrders();
  const currentAccount = account ?? wallet.address;

  useOrderEvents({
    enabled: true,
  });

  const orders = useMemo(() => {
    const currentOrders = ordersQuery.data?.orders ?? [];

    if (!currentAccount) {
      return currentOrders;
    }

    return currentOrders.filter(
      (order) => order.account.toLowerCase() === currentAccount.toLowerCase(),
    );
  }, [currentAccount, ordersQuery.data?.orders]);

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
    <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <TableProperties className="size-3.5" />
            Order Monitor
          </div>
          <CardTitle className="text-base font-semibold text-foreground">
            Orders
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Compact order monitor for the current wallet.
          </CardDescription>
        </div>

        <CardAction className="w-full sm:w-auto">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-4"
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

      <CardContent className="space-y-4 pt-5">
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard icon={<Activity className="size-4" />} label="Total" value={summary.total} />
          <SummaryCard icon={<Clock3 className="size-4" />} label="Active" value={summary.active} />
          <SummaryCard icon={<CheckCircle2 className="size-4" />} label="Filled" value={summary.filled} />
          <SummaryCard icon={<ShieldAlert className="size-4" />} label="Terminal" value={summary.terminal} />
        </div>

        {ordersQuery.isError ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {ordersQuery.error instanceof Error
              ? ordersQuery.error.message
              : "Failed to load orders."}
          </div>
        ) : null}

        {ordersQuery.isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-lg border bg-muted/50 p-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading orders...
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-muted/50 p-6 text-center">
            <div className="space-y-2">
              <div className="mx-auto inline-flex rounded-md bg-background p-3 text-muted-foreground">
                <TableProperties className="size-5" />
              </div>
              <div className="text-sm font-medium text-foreground">No orders yet</div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="h-[420px] overflow-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-muted/50 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order ID</th>
                    <th className="px-4 py-3 font-medium">Side</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Tx Hash</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-t transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-4">
                        <div className="max-w-[160px] truncate text-sm font-medium text-foreground">
                          {truncateValue(order.orderId)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatTimestamp(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <SideBadge side={order.side} />
                      </td>
                      <td className="px-4 py-4">
                        ${formatNumeric(order.price)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-foreground">
                          {order.amount}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-[160px] truncate text-xs text-muted-foreground">
                          {order.txHash ? truncateValue(order.txHash) : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-foreground">
                          {formatDistanceToNowStrict(order.updatedAt, {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
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
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <span className="text-primary">{props.icon}</span>
        {props.label}
      </div>
      <div className="text-sm font-medium text-foreground">{props.value}</div>
    </div>
  );
}

function SideBadge({ side }: { side: Order["side"] }) {
  const className =
    side === "buy"
      ? "border bg-primary/10 text-primary"
      : "border bg-muted text-foreground";

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] ${className}`}
    >
      {side}
    </span>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    pending: "border bg-muted text-muted-foreground",
    accepted: "border bg-primary/10 text-primary",
    matched: "border bg-primary/10 text-primary",
    partially_filled: "border bg-primary/10 text-primary",
    filled: "border bg-primary/10 text-primary",
    cancelled: "border bg-muted text-muted-foreground",
    rejected: "border border-destructive bg-destructive/10 text-destructive",
    expired: "border bg-muted text-muted-foreground",
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
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] ${styles[status]}`}
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
