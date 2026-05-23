/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import * as React from "react"

import type { PaginationState } from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Web3ActivitiesTable } from "./web3-activities-table"

import { useWeb3ActivitiesQuery } from "@/queries/web3-activities.queries"
import type {
  Web3ActivityRiskLevel,
  Web3ActivityStatus,
} from "@/types/web3-activities.types"

function getStringParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: string,
) {
  return searchParams.get(key) ?? fallback
}

function setOrDeleteParam(
  searchParams: URLSearchParams,
  key: string,
  value: string,
) {
  if (!value || value === "all") {
    searchParams.delete(key)
    return
  }

  searchParams.set(key, value)
}

export function Web3ActivitiesTableContainer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSearchParams = React.useMemo(() => {
    return new URLSearchParams(searchParams.toString())
  }, [searchParams])

  const page = Number(getStringParam(currentSearchParams, "page", "1"))
  const pageSize = Number(getStringParam(currentSearchParams, "pageSize", "20"))

  const search = getStringParam(currentSearchParams, "search", "")
  const status = getStringParam(
    currentSearchParams,
    "status",
    "all",
  ) as Web3ActivityStatus | "all"

  const riskLevel = getStringParam(
    currentSearchParams,
    "riskLevel",
    "all",
  ) as Web3ActivityRiskLevel | "all"

  const chain = getStringParam(currentSearchParams, "chain", "all")

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: Math.max(page - 1, 0),
    pageSize,
  })

  React.useEffect(() => {
    setPagination({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    })
  }, [page, pageSize])

  const activitiesQuery = useWeb3ActivitiesQuery({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search,
    status,
    riskLevel,
    chain,
  })

  function updateUrlParams(
    updates: Partial<{
      page: string
      pageSize: string
      search: string
      status: string
      riskLevel: string
      chain: string
    }>,
  ) {
    const nextParams = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue
      setOrDeleteParam(nextParams, key, value)
    }

    const queryString = nextParams.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname)
  }

  function handleSearchChange(value: string) {
    updateUrlParams({
      search: value,
      page: "1",
    })
  }

  function handleStatusChange(value: string) {
    updateUrlParams({
      status: value,
      page: "1",
    })
  }

  function handleRiskLevelChange(value: string) {
    updateUrlParams({
      riskLevel: value,
      page: "1",
    })
  }

  function handleChainChange(value: string) {
    updateUrlParams({
      chain: value,
      page: "1",
    })
  }

  function handleResetFilters() {
    const nextParams = new URLSearchParams(searchParams.toString())

    nextParams.delete("search")
    nextParams.delete("status")
    nextParams.delete("riskLevel")
    nextParams.delete("chain")
    nextParams.set("page", "1")
    nextParams.set("pageSize", String(pagination.pageSize))

    router.replace(`${pathname}?${nextParams.toString()}`)
  }

  function handlePaginationChange(
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) {
    setPagination((old) => {
      const next =
        typeof updater === "function" ? updater(old) : updater

      updateUrlParams({
        page: String(next.pageIndex + 1),
        pageSize: String(next.pageSize),
      })

      return next
    })
  }

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
    <Web3ActivitiesTable
      data={activitiesQuery.data.data}
      rowCount={activitiesQuery.data.meta.total}
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      toolbarState={{
        search,
        status,
        riskLevel,
        chain,
      }}
      onSearchChange={handleSearchChange}
      onStatusChange={handleStatusChange}
      onRiskLevelChange={handleRiskLevelChange}
      onChainChange={handleChainChange}
      onResetFilters={handleResetFilters}
      onRefresh={() => activitiesQuery.refetch()}
      isRefreshing={activitiesQuery.isFetching}
    />
  )
}
