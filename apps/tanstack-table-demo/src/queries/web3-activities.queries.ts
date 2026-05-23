import { queryOptions, useQuery } from "@tanstack/react-query"

import { web3ActivitiesKeys } from "@/queries/query-keys/web3-activities.keys"
import { getWeb3Activities } from "@/services/web3-activities.service"

export function web3ActivitiesQueryOptions() {
  return queryOptions({
    queryKey: web3ActivitiesKeys.lists(),
    queryFn: getWeb3Activities,
  })
}

export function useWeb3ActivitiesQuery() {
  return useQuery(web3ActivitiesQueryOptions())
}
