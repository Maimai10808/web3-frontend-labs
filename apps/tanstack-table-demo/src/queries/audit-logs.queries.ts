import { queryOptions, useQuery } from "@tanstack/react-query"

import { auditLogsKeys } from "@/queries/query-keys/audit-logs.keys"
import { getAuditLogs } from "@/services/audit-logs.service"

export function auditLogsQueryOptions() {
  return queryOptions({
    queryKey: auditLogsKeys.lists(),
    queryFn: getAuditLogs,
  })
}

export function useAuditLogsQuery() {
  return useQuery(auditLogsQueryOptions())
}