"use client"

import * as React from "react"

import type { PaginationState } from "@tanstack/react-table"

import { Web3ActivitiesTable } from "./web3-activities-table"

import { useWeb3ActivitiesQuery } from "@/queries/web3-activities.queries"

export function Web3ActivitiesTableContainer() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const activitiesQuery = useWeb3ActivitiesQuery({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

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
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          Total activities:{" "}
          <span className="font-medium text-foreground">
            {activitiesQuery.data.meta.total}
          </span>
        </div>

        {activitiesQuery.isFetching ? (
          <div>Updating...</div>
        ) : null}
      </div>

      <Web3ActivitiesTable
        data={activitiesQuery.data.data}
        rowCount={activitiesQuery.data.meta.total}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  )
}
