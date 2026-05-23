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

  const search = String(req.query.search ?? "").trim().toLowerCase()
  const status = String(req.query.status ?? "all")
  const riskLevel = String(req.query.riskLevel ?? "all")
  const chain = String(req.query.chain ?? "all")

  const filteredActivities = web3TableActivities.filter((activity) => {
    const matchesSearch = search
      ? [
          activity.id,
          activity.requestId,
          activity.chain,
          activity.protocol,
          activity.eventType,
          activity.walletAddress,
          activity.walletTag,
          activity.txHash,
          activity.assetIn,
          activity.assetOut,
          activity.region,
          activity.teamOwner,
          activity.notes,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search)
      : true

    const matchesStatus =
      status === "all" ? true : activity.status === status

    const matchesRiskLevel =
      riskLevel === "all" ? true : activity.riskLevel === riskLevel

    const matchesChain =
      chain === "all" ? true : activity.chain === chain

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRiskLevel &&
      matchesChain
    )
  })

  const total = filteredActivities.length
  const pageCount = Math.ceil(total / pageSize)

  const start = (page - 1) * pageSize
  const end = start + pageSize

  const data = filteredActivities.slice(start, end)

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
