"use client"

import { PeopleTable } from "./people-table"

import { usePeopleQuery } from "@/queries/people.queries"

export function PeopleTableContainer() {
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

  return <PeopleTable data={peopleQuery.data.data} />
}
