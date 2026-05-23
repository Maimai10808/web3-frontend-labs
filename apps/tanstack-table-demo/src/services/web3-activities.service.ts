import { apiClient } from "@/lib/api-client"
import type {
  Web3ActivitiesListParams,
  Web3ActivitiesResponse,
} from "@/types/web3-activities.types"

export function getWeb3Activities(params: Web3ActivitiesListParams) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  })

  return apiClient<Web3ActivitiesResponse>(
    `/api/table-demo/activities?${searchParams.toString()}`,
  )
}
