"use client"

import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

import { peopleTableColumns } from "./people-table-columns"
import { PeopleTableView } from "./people-table-view"

import type { Person } from "@/types/people.types"

type PeopleTableProps = {
  data: Person[]
}

export function PeopleTable({ data }: PeopleTableProps) {
  const table = useReactTable({
    data,
    columns: peopleTableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <PeopleTableView
      table={table}
      columnCount={peopleTableColumns.length}
    />
  )
}
