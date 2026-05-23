import type { Web3ActivitiesListParams } from "@/types/web3-activities.types"

export const web3ActivitiesKeys = {
  all: ["web3-activities"] as const,

  lists: () => [...web3ActivitiesKeys.all, "list"] as const,

  list: (params: Web3ActivitiesListParams) =>
    [...web3ActivitiesKeys.lists(), params] as const,
}
