import { Router } from "express"

import { people } from "./table-demo.data"
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

tableDemoRoutes.get("/activities", (_req, res) => {
  res.json({
    data: web3TableActivities,
    meta: web3TableActivityMeta,
  })
})
