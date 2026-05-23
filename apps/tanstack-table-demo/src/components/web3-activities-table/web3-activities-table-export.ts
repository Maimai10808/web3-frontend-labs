import type { Web3TableActivity } from "@/types/web3-activities.types"

function escapeCsvCell(value: string | number) {
  const stringValue = String(value)

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

export function exportWeb3ActivitiesCsv(
  activities: Web3TableActivity[],
) {
  const headers = [
    "id",
    "requestId",
    "chain",
    "protocol",
    "eventType",
    "status",
    "walletAddress",
    "walletTag",
    "txHash",
    "blockNumber",
    "assetIn",
    "assetOut",
    "amountIn",
    "usdValue",
    "gasUsd",
    "slippageBps",
    "riskLevel",
    "riskScore",
    "region",
    "teamOwner",
    "createdAt",
  ]

  const rows = activities.map((activity) => {
    return headers.map((header) => {
      const value = activity[header as keyof Web3TableActivity]
      return escapeCsvCell(value ?? "")
    })
  })

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `web3-activities-${Date.now()}.csv`
  link.click()

  URL.revokeObjectURL(url)
}
