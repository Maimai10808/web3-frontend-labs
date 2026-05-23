import { apiClient } from "@/lib/api-client"
import type { Web3ActivitiesResponse } from "@/types/web3-activities.types"

export function getWeb3Activities() {
  return apiClient<Web3ActivitiesResponse>("/api/table-demo/activities")
}
