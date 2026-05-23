// apps/tanstack-table-demo/src/services/table-demo.service.ts
import { apiClient } from "@/lib/api-client"
import type { PeopleResponse } from "@/types/table-demo.types"

export function getPeople() {
  return apiClient<PeopleResponse>("/api/table-demo/people")
}
