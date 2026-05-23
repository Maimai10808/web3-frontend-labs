import { createColumnHelper } from "@tanstack/react-table"
import {
  AlertTriangleIcon,
  ArrowRightLeftIcon,
  CheckCircle2Icon,
  Clock3Icon,
  CopyIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  WalletIcon,
  XCircleIcon,
} from "lucide-react"

import { Button } from "@web3-frontend-labs/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@web3-frontend-labs/ui/components/dropdown-menu"

import type { Web3TableActivity } from "@/types/web3-activities.types"

const columnHelper = createColumnHelper<Web3TableActivity>()

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function getStatusMeta(status: Web3TableActivity["status"]) {
  switch (status) {
    case "succeeded":
      return {
        icon: CheckCircle2Icon,
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      }
    case "processing":
      return {
        icon: Clock3Icon,
        className: "border-blue-200 bg-blue-50 text-blue-700",
      }
    case "queued":
      return {
        icon: Clock3Icon,
        className: "border-slate-200 bg-slate-50 text-slate-700",
      }
    case "failed":
      return {
        icon: XCircleIcon,
        className: "border-red-200 bg-red-50 text-red-700",
      }
    case "cancelled":
      return {
        icon: XCircleIcon,
        className: "border-zinc-200 bg-zinc-50 text-zinc-700",
      }
  }
}

function getRiskMeta(riskLevel: Web3TableActivity["riskLevel"]) {
  switch (riskLevel) {
    case "low":
      return {
        icon: ShieldCheckIcon,
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      }
    case "medium":
      return {
        icon: ShieldAlertIcon,
        className: "border-amber-200 bg-amber-50 text-amber-700",
      }
    case "high":
      return {
        icon: AlertTriangleIcon,
        className: "border-orange-200 bg-orange-50 text-orange-700",
      }
    case "critical":
      return {
        icon: AlertTriangleIcon,
        className: "border-red-200 bg-red-50 text-red-700",
      }
  }
}

function copyToClipboard(value: string) {
  void navigator.clipboard?.writeText(value)
}

export const web3ActivitiesTableColumns = [
  columnHelper.accessor("id", {
    header: "Activity",
    cell: ({ row }) => {
      const activity = row.original

      return (
        <div className="flex min-w-[180px] items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
            <ArrowRightLeftIcon className="size-4 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            <div className="font-mono text-xs font-medium text-foreground">
              {activity.id}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {activity.eventType} · {activity.protocol}
            </div>
          </div>
        </div>
      )
    },
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue()
      const meta = getStatusMeta(status)
      const Icon = meta.icon

      return (
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
            meta.className,
          ].join(" ")}
        >
          <Icon className="size-3.5" />
          {status}
        </span>
      )
    },
  }),

  columnHelper.accessor("chain", {
    header: "Chain",
    cell: (info) => (
      <span className="rounded-md border bg-muted/30 px-2 py-1 text-xs font-medium">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor("walletTag", {
    header: "Wallet",
    cell: ({ row }) => {
      const activity = row.original

      return (
        <div className="min-w-[170px]">
          <div className="flex items-center gap-1.5 font-medium">
            <WalletIcon className="size-3.5 text-muted-foreground" />
            {activity.walletTag}
          </div>
          <div className="mt-0.5 font-mono text-xs text-muted-foreground">
            {formatAddress(activity.walletAddress)}
          </div>
        </div>
      )
    },
  }),

  columnHelper.accessor("txHash", {
    header: "Tx Hash",
    cell: (info) => {
      const txHash = info.getValue()

      return (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-muted-foreground">
            {formatAddress(txHash)}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 opacity-60 hover:opacity-100"
            onClick={() => copyToClipboard(txHash)}
          >
            <CopyIcon className="size-3.5" />
            <span className="sr-only">Copy transaction hash</span>
          </Button>
        </div>
      )
    },
  }),

  columnHelper.accessor("blockNumber", {
    header: () => <div className="text-right">Block</div>,
    cell: (info) => (
      <div className="text-right font-mono text-xs tabular-nums text-muted-foreground">
        {formatNumber(info.getValue())}
      </div>
    ),
  }),

  columnHelper.accessor("assetIn", {
    header: "Pair",
    cell: ({ row }) => {
      const activity = row.original

      return (
        <div className="flex min-w-[120px] items-center gap-2">
          <span className="rounded-md border bg-background px-2 py-1 text-xs font-semibold">
            {activity.assetIn}
          </span>
          <ArrowRightLeftIcon className="size-3.5 text-muted-foreground" />
          <span className="rounded-md border bg-background px-2 py-1 text-xs font-semibold">
            {activity.assetOut}
          </span>
        </div>
      )
    },
  }),

  columnHelper.accessor("amountIn", {
    header: () => <div className="text-right">Amount</div>,
    cell: (info) => (
      <div className="text-right font-medium tabular-nums">
        {formatNumber(info.getValue())}
      </div>
    ),
  }),

  columnHelper.accessor("usdValue", {
    header: () => <div className="text-right">Volume</div>,
    cell: (info) => (
      <div className="text-right">
        <div className="font-semibold tabular-nums text-foreground">
          {formatUsd(info.getValue())}
        </div>
        <div className="text-xs text-muted-foreground">USD notional</div>
      </div>
    ),
  }),

  columnHelper.accessor("gasUsd", {
    header: () => <div className="text-right">Gas</div>,
    cell: (info) => (
      <div className="text-right text-sm tabular-nums text-muted-foreground">
        {formatUsd(info.getValue())}
      </div>
    ),
  }),

  columnHelper.accessor("slippageBps", {
    header: () => <div className="text-right">Slippage</div>,
    cell: (info) => (
      <div className="text-right text-sm tabular-nums">
        {info.getValue()} bps
      </div>
    ),
  }),

  columnHelper.accessor("riskLevel", {
    header: "Risk",
    cell: (info) => {
      const riskLevel = info.getValue()
      const meta = getRiskMeta(riskLevel)
      const Icon = meta.icon

      return (
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
            meta.className,
          ].join(" ")}
        >
          <Icon className="size-3.5" />
          {riskLevel}
        </span>
      )
    },
  }),

  columnHelper.accessor("riskScore", {
    header: () => <div className="text-right">Score</div>,
    cell: (info) => {
      const value = info.getValue()

      return (
        <div className="flex min-w-[120px] items-center justify-end gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
            <div
              className={[
                "h-full rounded-full",
                value >= 80
                  ? "bg-red-500"
                  : value >= 60
                    ? "bg-orange-500"
                    : value >= 35
                      ? "bg-amber-500"
                      : "bg-emerald-500",
              ].join(" ")}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="w-8 text-right text-sm tabular-nums">
            {value}
          </span>
        </div>
      )
    },
  }),

  columnHelper.accessor("region", {
    header: "Region",
    cell: (info) => (
      <span className="text-sm text-muted-foreground">{info.getValue()}</span>
    ),
  }),

  columnHelper.accessor("teamOwner", {
    header: "Owner",
    cell: (info) => (
      <span className="rounded-md border bg-muted/30 px-2 py-1 text-xs font-medium">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: (info) => (
      <div className="min-w-[160px] text-sm text-muted-foreground">
        {new Date(info.getValue()).toLocaleString()}
      </div>
    ),
  }),

  columnHelper.display({
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const activity = row.original

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">Open activity actions</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => console.log("Open activity", activity.id)}
              >
                <ExternalLinkIcon className="size-4" />
                View details
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => copyToClipboard(activity.txHash)}
              >
                <CopyIcon className="size-4" />
                Copy tx hash
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => console.log("Review risk", activity.id)}
              >
                <ShieldAlertIcon className="size-4" />
                Review risk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  }),
]
