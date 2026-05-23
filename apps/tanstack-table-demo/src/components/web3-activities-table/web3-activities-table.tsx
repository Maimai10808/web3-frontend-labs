"use client"

import {
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table"

import { web3ActivitiesTableColumns } from "./web3-activities-table-columns"
import { Web3ActivitiesTableView } from "./web3-activities-table-view"

import type { Web3TableActivity } from "@/types/web3-activities.types"

type Web3ActivitiesTableProps = {
  data: Web3TableActivity[]
  rowCount: number
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
}

export function Web3ActivitiesTable({
  data,
  rowCount,
  pagination,
  onPaginationChange,
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
    />
  )
}
