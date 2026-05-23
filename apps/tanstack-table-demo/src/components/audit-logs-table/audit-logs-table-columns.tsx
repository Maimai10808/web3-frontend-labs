import { createColumnHelper } from "@tanstack/react-table"

import type { AuditLogEvent } from "@/types/audit-logs.types"

const columnHelper = createColumnHelper<AuditLogEvent>()

function formatDuration(ms: number) {
  if (ms < 1000) {
    return `${ms}ms`
  }

  return `${(ms / 1000).toFixed(2)}s`
}

export const auditLogsTableColumns = [
  columnHelper.accessor("id", {
    header: "Log ID",
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("timestamp", {
    header: "Time",
    cell: (info) => (
      <span className="whitespace-nowrap">
        {new Date(info.getValue()).toLocaleString()}
      </span>
    ),
  }),
  columnHelper.accessor("severity", {
    header: "Severity",
    cell: (info) => (
      <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("eventType", {
    header: "Event",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("actor", {
    header: "Actor",
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("team", {
    header: "Team",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("environment", {
    header: "Env",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("region", {
    header: "Region",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("resourceType", {
    header: "Resource",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("resourceId", {
    header: "Resource ID",
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("method", {
    header: "Method",
    cell: (info) => (
      <span className="font-mono text-xs font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("path", {
    header: "Path",
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("httpStatus", {
    header: "HTTP",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("durationMs", {
    header: "Duration",
    cell: (info) => formatDuration(info.getValue()),
  }),
  columnHelper.accessor("retryCount", {
    header: "Retries",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("ipAddress", {
    header: "IP",
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("message", {
    header: "Message",
    cell: (info) => (
      <span className="inline-block max-w-[320px] truncate">
        {info.getValue()}
      </span>
    ),
  }),
]
