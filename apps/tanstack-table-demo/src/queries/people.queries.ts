import { queryOptions, useQuery } from "@tanstack/react-query"

import { peopleKeys } from "@/queries/query-keys/people.keys"
import { getPeople } from "@/services/people.service"

export function peopleQueryOptions() {
  return queryOptions({
    queryKey: peopleKeys.lists(),
    queryFn: getPeople,
  })
}

export function usePeopleQuery() {
  return useQuery(peopleQueryOptions())
}
