"use client"

import { TableDisplay } from "./table-display"

import { usePeopleQuery } from "@/queries/table-demo.queries"

export function TableDisplayContainer() {
  const peopleQuery = usePeopleQuery()

  if (peopleQuery.isPending) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Loading people...
      </div>
    )
  }

  if (peopleQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/40 p-6 text-sm text-destructive">
        {peopleQuery.error.message}
      </div>
    )
  }

  return <TableDisplay data={peopleQuery.data.data} />
}
