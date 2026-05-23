export const auditLogsKeys = {
  all: ["audit-logs"] as const,

  lists: () => [...auditLogsKeys.all, "list"] as const,
}
