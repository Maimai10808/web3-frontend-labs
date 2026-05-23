"use client"

import {
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table"

import { web3ActivitiesTableColumns } from "./web3-activities-table-columns"
import { Web3ActivitiesTableView } from "./web3-activities-table-view"

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

type Web3ActivitiesTableProps = {
  data: Web3TableActivity[]
  rowCount: number
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>

  toolbarState: Web3ActivitiesToolbarState
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onRiskLevelChange: (value: string) => void
  onChainChange: (value: string) => void
  onResetFilters: () => void

  onRefresh: () => void
  isRefreshing: boolean
}

export function Web3ActivitiesTable({
  data,
  rowCount,
  pagination,
  onPaginationChange,
  toolbarState,
  onSearchChange,
  onStatusChange,
  onRiskLevelChange,
  onChainChange,
  onResetFilters,
  onRefresh,
  isRefreshing,
}: Web3ActivitiesTableProps) {
  const table = useReactTable({
    data,
    columns: web3ActivitiesTableColumns,
    rowCount,
    state: {
      pagination,
    },
    onPaginationChange,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Web3ActivitiesTableView
      table={table}
      columnCount={web3ActivitiesTableColumns.length}
      toolbarState={toolbarState}
      onSearchChange={onSearchChange}
      onStatusChange={onStatusChange}
      onRiskLevelChange={onRiskLevelChange}
      onChainChange={onChainChange}
      onResetFilters={onResetFilters}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
    />
  )
}
