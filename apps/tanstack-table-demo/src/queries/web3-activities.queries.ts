// src/queries/web3-activities.queries.ts

import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query"

import { web3ActivitiesKeys } from "@/queries/query-keys/web3-activities.keys"
import { getWeb3Activities } from "@/services/web3-activities.service"
import type { Web3ActivitiesListParams } from "@/types/web3-activities.types"

export function web3ActivitiesQueryOptions(
  params: Web3ActivitiesListParams,
) {
  return queryOptions({
    queryKey: web3ActivitiesKeys.list(params),
    queryFn: () => getWeb3Activities(params),
    placeholderData: keepPreviousData,
  })
}

export function useWeb3ActivitiesQuery(
  params: Web3ActivitiesListParams,
) {
  return useQuery(web3ActivitiesQueryOptions(params))
}
