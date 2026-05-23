import { queryOptions, useQuery } from "@tanstack/react-query"

import { tableDemoKeys } from "@/queries/query-keys/table-demo.keys"
import { getPeople } from "@/services/table-demo.service"

export function peopleQueryOptions() {
  return queryOptions({
    queryKey: tableDemoKeys.people(),
    queryFn: getPeople,
  })
}

export function usePeopleQuery() {
  return useQuery(peopleQueryOptions())
}
