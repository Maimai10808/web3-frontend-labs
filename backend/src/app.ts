import cors from "cors"
import express from "express"

import { errorHandler } from "./middlewares/error-handler"
import { notFound } from "./middlewares/not-found"
import { apiRoutes } from "./routes"

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get("/", (_req, res) => {
    res.json({
      name: "@web3-frontend-labs/backend",
      status: "ok",
    })
  })

  app.use("/api", apiRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
