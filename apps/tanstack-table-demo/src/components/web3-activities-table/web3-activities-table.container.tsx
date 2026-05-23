"use client"

import { Web3ActivitiesTable } from "./web3-activities-table"

import { useWeb3ActivitiesQuery } from "@/queries/web3-activities.queries"

export function Web3ActivitiesTableContainer() {
  const activitiesQuery = useWeb3ActivitiesQuery()

  if (activitiesQuery.isPending) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Loading Web3 activities...
      </div>
    )
  }

  if (activitiesQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/40 p-6 text-sm text-destructive">
        {activitiesQuery.error.message}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Total activities:{" "}
        <span className="font-medium text-foreground">
          {activitiesQuery.data.meta.total}
        </span>
      </div>

      <Web3ActivitiesTable data={activitiesQuery.data.data} />
    </div>
  )
}
