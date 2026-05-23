export type Web3ActivityStatus =
  | "queued"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"

export type Web3ActivityRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"

export type Web3TableActivity = {
  id: string
  requestId: string
  chain: string
  protocol: string
  eventType: string
  status: Web3ActivityStatus
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
  riskLevel: Web3ActivityRiskLevel
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
  search?: string
  status?: Web3ActivityStatus | "all"
  riskLevel?: Web3ActivityRiskLevel | "all"
  chain?: string
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
