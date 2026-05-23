export const web3ActivitiesKeys = {
  all: ["web3-activities"] as const,
  lists: () => [...web3ActivitiesKeys.all, "list"] as const,
}
