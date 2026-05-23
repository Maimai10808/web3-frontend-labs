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

export type Web3ActivitiesResponse = {
  data: Web3TableActivity[]
  meta: {
    total: number
    scenario: string
    generatedAt: string
  }
}
