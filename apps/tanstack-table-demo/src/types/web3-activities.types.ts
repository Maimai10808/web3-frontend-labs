export type Web3TableActivity = {
  id: string
  requestId: string
  chain: string
  protocol: string
  eventType: string
  status: "queued" | "processing" | "succeeded" | "failed" | "cancelled"
  walletAddress: string
  walletTag: string
  txHash: string
  blockNumber: number
  assetIn: string
  assetOut: string
  amountIn: number
  usdValue: number
  gasUsd: number
  slippageBps: number
  riskLevel: "low" | "medium" | "high" | "critical"
  riskScore: number
  region: string
  teamOwner: string
  createdAt: string
  updatedAt: string
  retryCount: number
  confirmationCount: number
  notes: string
}

export type Web3ActivitiesListParams = {
  page: number
  pageSize: number
}

export type Web3ActivitiesResponse = {
  data: Web3TableActivity[]
  meta: {
    total: number
    page: number
    pageSize: number
    pageCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
    scenario: string
    generatedAt: string
  }
}
