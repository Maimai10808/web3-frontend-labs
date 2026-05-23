import { Router } from "express"

export const healthRoutes = Router()

healthRoutes.get("/", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  })
})
