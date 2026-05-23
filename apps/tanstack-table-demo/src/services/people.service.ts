import { apiClient } from "@/lib/api-client"
import type { PeopleResponse } from "@/types/people.types"

export function getPeople() {
  return apiClient<PeopleResponse>("/api/table-demo/people")
}
