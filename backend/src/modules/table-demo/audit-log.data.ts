import auditLogEventsJson from "./audit-log-virtual-scroll-dataset.json"

import type { AuditLogEvent } from "./audit-log.types"

export const auditLogEvents = auditLogEventsJson as AuditLogEvent[]

export const auditLogMeta = {
  total: auditLogEvents.length,
  scenario: "Audit log event stream for virtual scrolling table performance testing",
  generatedAt: "2026-05-23T00:00:00.000Z",
} as const
