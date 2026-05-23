import { Router } from "express"

import { people } from "./table-demo.data"
import { auditLogEvents, auditLogMeta } from "./audit-log.data"
import {
  web3TableActivities,
  web3TableActivityMeta,
} from "./web3-table-500-dataset"

export const tableDemoRoutes = Router()

tableDemoRoutes.get("/people", (_req, res) => {
  res.json({
    data: people,
  })
})

tableDemoRoutes.get("/activities", (req, res) => {
  const page = Math.max(Number(req.query.page ?? 1), 1)

  const pageSize = Math.min(
    Math.max(Number(req.query.pageSize ?? 20), 1),
    100,
  )

  const total = web3TableActivities.length
  const pageCount = Math.ceil(total / pageSize)

  const start = (page - 1) * pageSize
  const end = start + pageSize

  const data = web3TableActivities.slice(start, end)

  res.json({
    data,
    meta: {
      ...web3TableActivityMeta,
      total,
      page,
      pageSize,
      pageCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < pageCount,
    },
  })
})

tableDemoRoutes.get("/audit-logs", (_req, res) => {
  res.json({
    data: auditLogEvents,
    meta: auditLogMeta,
  })
})
