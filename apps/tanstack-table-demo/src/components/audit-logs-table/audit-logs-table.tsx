"use client"

import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

import { auditLogsTableColumns } from "./audit-logs-table-columns"
import { AuditLogsTableView } from "./audit-logs-table-view"

import type { AuditLogEvent } from "@/types/audit-logs.types"

type AuditLogsTableProps = {
  data: AuditLogEvent[]
}

export function AuditLogsTable({ data }: AuditLogsTableProps) {
  const table = useReactTable({
    data,
    columns: auditLogsTableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <AuditLogsTableView
      table={table}
      columnCount={auditLogsTableColumns.length}
    />
  )
}
