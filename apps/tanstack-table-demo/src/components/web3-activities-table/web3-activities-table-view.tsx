"use client"

import * as React from "react"

import {
  flexRender,
  type Table as TanStackTable,
} from "@tanstack/react-table"
import {
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FilterIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  WalletCardsIcon,
} from "lucide-react"

import { Web3ActivityDetailDrawer } from "./web3-activity-detail-drawer"
import { exportWeb3ActivitiesCsv } from "./web3-activities-table-export"

import { Button } from "@web3-frontend-labs/ui/components/button"
import { Input } from "@web3-frontend-labs/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@web3-frontend-labs/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@web3-frontend-labs/ui/components/table"

import type {
  Web3ActivityRiskLevel,
  Web3ActivityStatus,
  Web3TableActivity,
} from "@/types/web3-activities.types"

type Web3ActivitiesToolbarState = {
  search: string
  status: Web3ActivityStatus | "all"
  riskLevel: Web3ActivityRiskLevel | "all"
  chain: string
}

type Web3ActivitiesTableViewProps = {
  table: TanStackTable<Web3TableActivity>
  columnCount: number

  toolbarState: Web3ActivitiesToolbarState
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onRiskLevelChange: (value: string) => void
  onChainChange: (value: string) => void
  onResetFilters: () => void

  onRefresh: () => void
  isRefreshing: boolean
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value)
}

const chainOptions = [
  "Ethereum",
  "Arbitrum",
  "Optimism",
  "Base",
  "Polygon",
  "BNB Chain",
  "Avalanche",
  "Solana",
]

export function Web3ActivitiesTableView({
  table,
  columnCount,
  toolbarState,
  onSearchChange,
  onStatusChange,
  onRiskLevelChange,
  onChainChange,
  onResetFilters,
  onRefresh,
  isRefreshing,
}: Web3ActivitiesTableViewProps) {
  const [selectedActivity, setSelectedActivity] =
    React.useState<Web3TableActivity | null>(null)

  const rows = table.getRowModel().rows
  const currentPage = table.getState().pagination.pageIndex + 1
  const pageCount = table.getPageCount()

  const pageActivities = rows.map((row) => row.original)

  const pageVolume = rows.reduce((total, row) => {
    return total + row.original.usdValue
  }, 0)

  const highRiskCount = rows.filter((row) => {
    return row.original.riskLevel === "high" || row.original.riskLevel === "critical"
  }).length

  const succeededCount = rows.filter((row) => {
    return row.original.status === "succeeded"
  }).length

  const successRate = rows.length
    ? Math.round((succeededCount / rows.length) * 100)
    : 0

  return (
    <>
      <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="border-b bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_35%),linear-gradient(to_right,rgba(15,23,42,0.04),transparent)] p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <ActivityIcon className="size-3.5 text-blue-500" />
                Live operations monitor
              </div>

              <div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Web3 Activities
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Monitor wallet activity, protocol operations, transaction
                  risk, gas usage and settlement state across chains.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border bg-background/80 p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    Page Rows
                  </div>
                  <WalletCardsIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums">
                  {rows.length}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Current page records
                </div>
              </div>

              <div className="rounded-xl border bg-background/80 p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    Page Volume
                  </div>
                  <TrendingUpIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatUsd(pageVolume)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Aggregated notional
                </div>
              </div>

              <div className="rounded-xl border bg-background/80 p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    High Risk
                  </div>
                  <ShieldAlertIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums">
                  {highRiskCount}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  High or critical rows
                </div>
              </div>

              <div className="rounded-xl border bg-background/80 p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    Success Rate
                  </div>
                  <ActivityIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums">
                  {successRate}%
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Succeeded on this page
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-b bg-muted/20 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={toolbarState.search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search activity, wallet, hash..."
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onResetFilters}
              >
                <FilterIcon className="size-4" />
                Reset
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => exportWeb3ActivitiesCsv(pageActivities)}
              >
                <DownloadIcon className="size-4" />
                Export CSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCwIcon
                  className={[
                    "size-4",
                    isRefreshing ? "animate-spin" : "",
                  ].join(" ")}
                />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <Select
              value={toolbarState.status}
              onValueChange={onStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={toolbarState.riskLevel}
              onValueChange={onRiskLevelChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All risk levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={toolbarState.chain} onValueChange={onChainChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All chains</SelectItem>
                {chainOptions.map((chain) => (
                  <SelectItem key={chain} value={chain}>
                    {chain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-11 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group cursor-pointer border-b transition-colors hover:bg-muted/40"
                    onClick={() => setSelectedActivity(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="h-16 whitespace-nowrap align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columnCount} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="flex size-14 items-center justify-center rounded-full border bg-muted/30">
                        <ActivityIcon className="size-6 text-muted-foreground" />
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          No activities found
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Try changing filters or refreshing the activity stream.
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter className="bg-muted/20">
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id} className="hover:bg-transparent">
                  {footerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      className="h-11 whitespace-nowrap text-xs font-normal text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Page{" "}
            <span className="font-medium text-foreground tabular-nums">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground tabular-nums">
              {pageCount}
            </span>{" "}
            · Showing{" "}
            <span className="font-medium text-foreground tabular-nums">
              {rows.length}
            </span>{" "}
            activities
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="gap-2"
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="gap-2"
            >
              Next
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <Web3ActivityDetailDrawer
        activity={selectedActivity}
        open={Boolean(selectedActivity)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedActivity(null)
          }
        }}
      />
    </>
  )
}
