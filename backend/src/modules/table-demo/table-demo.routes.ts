import { Router } from "express"

import {
  web3TableActivities,
  web3TableActivityMeta,
} from "./web3-table-500-dataset"

export const tableDemoRoutes = Router()

tableDemoRoutes.get("/activities", (_req, res) => {
  res.json({
    data: web3TableActivities,
    meta: web3TableActivityMeta,
  })
})
