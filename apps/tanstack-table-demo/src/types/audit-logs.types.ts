export type AuditLogEvent = {
  id: string
  timestamp: string
  eventType: string
  severity: "debug" | "info" | "warning" | "error" | "critical"
  status: "received" | "processing" | "completed" | "failed" | "ignored"
  actor: string
  team: string
  environment: "production" | "staging" | "development"
  region: string
  resourceType: string
  resourceId: string
  requestId: string
  sessionId: string
  ipAddress: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  httpStatus: number
  durationMs: number
  retryCount: number
  message: string
}

export type AuditLogsResponse = {
  data: AuditLogEvent[]
  meta: {
    total: number
    scenario: string
    generatedAt: string
  }
}