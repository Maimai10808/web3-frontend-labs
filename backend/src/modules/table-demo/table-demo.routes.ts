import { Router } from "express"

import { people } from "./table-demo.data"

export const tableDemoRoutes = Router()

tableDemoRoutes.get("/people", (_req, res) => {
  res.json({
    data: people,
  })
})

tableDemoRoutes.get("/people/:id", (req, res) => {
  const person = people.find((item) => item.id === req.params.id)

  if (!person) {
    res.status(404).json({
      error: {
        message: "Person not found",
      },
    })
    return
  }

  res.json({
    data: person,
  })
})
