import { apiClient } from "@/lib/api-client"
import type {
  Web3ActivitiesListParams,
  Web3ActivitiesResponse,
} from "@/types/web3-activities.types"

function appendOptionalParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value === undefined) return
  if (value === "") return
  if (value === "all") return

  searchParams.set(key, String(value))
}

export function getWeb3Activities(params: Web3ActivitiesListParams) {
  const searchParams = new URLSearchParams()

  searchParams.set("page", String(params.page))
  searchParams.set("pageSize", String(params.pageSize))

  appendOptionalParam(searchParams, "search", params.search)
  appendOptionalParam(searchParams, "status", params.status)
  appendOptionalParam(searchParams, "riskLevel", params.riskLevel)
  appendOptionalParam(searchParams, "chain", params.chain)

  return apiClient<Web3ActivitiesResponse>(
    `/api/table-demo/activities?${searchParams.toString()}`,
  )
}