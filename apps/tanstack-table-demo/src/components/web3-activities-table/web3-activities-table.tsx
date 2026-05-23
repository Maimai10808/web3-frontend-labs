/* eslint-disable react-hooks/incompatible-library */
"use client"

import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

import { web3ActivitiesTableColumns } from "./web3-activities-table-columns"
import { Web3ActivitiesTableView } from "./web3-activities-table-view"

import type { Web3TableActivity } from "@/types/web3-activities.types"

type Web3ActivitiesTableProps = {
  data: Web3TableActivity[]
}

export function Web3ActivitiesTable({ data }: Web3ActivitiesTableProps) {
  const table = useReactTable({
    data,
    columns: web3ActivitiesTableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Web3ActivitiesTableView
      table={table}
      columnCount={web3ActivitiesTableColumns.length}
    />
  )
}
