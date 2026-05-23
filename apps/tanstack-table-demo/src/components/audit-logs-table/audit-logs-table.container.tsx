"use client"

import { AuditLogsTable } from "./audit-logs-table"

import { useAuditLogsQuery } from "@/queries/audit-logs.queries"

export function AuditLogsTableContainer() {
  const auditLogsQuery = useAuditLogsQuery()

  if (auditLogsQuery.isPending) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Loading audit logs...
      </div>
    )
  }

  if (auditLogsQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/40 p-6 text-sm text-destructive">
        {auditLogsQuery.error.message}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          Total audit logs:{" "}
          <span className="font-medium text-foreground">
            {auditLogsQuery.data.meta.total}
          </span>
        </div>

        {auditLogsQuery.isFetching ? <div>Updating...</div> : null}
      </div>

      <AuditLogsTable data={auditLogsQuery.data.data} />
    </div>
  )
}
