import { Router } from "express"

import { healthRoutes } from "../modules/health/health.routes"
import { tableDemoRoutes } from "../modules/table-demo/table-demo.routes"

export const apiRoutes = Router()

apiRoutes.use("/health", healthRoutes)
apiRoutes.use("/table-demo", tableDemoRoutes)
