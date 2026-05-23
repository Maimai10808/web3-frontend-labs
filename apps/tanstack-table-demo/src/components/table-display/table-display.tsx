/* eslint-disable react-hooks/incompatible-library */
"use client"

import {
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { TableDisplayView } from "./table-display-view"
import { tableDisplayColumns } from "./table-display-columns"

import type { Person } from "@/types/table-demo.types"

type TableDisplayProps = {
  data: Person[]
}

export function TableDisplay({ data }: TableDisplayProps) {
  const table = useReactTable({
    data,
    columns: tableDisplayColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <TableDisplayView
      table={table}
      columnCount={tableDisplayColumns.length}
    />
  )
}
