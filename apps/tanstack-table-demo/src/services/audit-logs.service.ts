import { apiClient } from "@/lib/api-client"
import type { AuditLogsResponse } from "@/types/audit-logs.types"

export function getAuditLogs() {
  return apiClient<AuditLogsResponse>("/api/table-demo/audit-logs")
}