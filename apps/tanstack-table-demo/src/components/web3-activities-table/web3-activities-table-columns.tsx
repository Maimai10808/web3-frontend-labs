import { createColumnHelper } from "@tanstack/react-table"

import type { Web3TableActivity } from "@/types/web3-activities.types"

const columnHelper = createColumnHelper<Web3TableActivity>()

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export const web3ActivitiesTableColumns = [
  columnHelper.accessor("id", {
    header: "Activity ID",
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue()

      return (
        <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
          {status}
        </span>
      )
    },
  }),
  columnHelper.accessor("chain", {
    header: "Chain",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("protocol", {
    header: "Protocol",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("eventType", {
    header: "Event",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("walletTag", {
    header: "Wallet Tag",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("walletAddress", {
    header: "Wallet",
    cell: (info) => (
      <span className="font-mono text-xs">{formatAddress(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("txHash", {
    header: "Tx Hash",
    cell: (info) => (
      <span className="font-mono text-xs">{formatAddress(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("blockNumber", {
    header: "Block",
    cell: (info) => formatNumber(info.getValue()),
  }),
  columnHelper.accessor("assetIn", {
    header: "Asset In",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("assetOut", {
    header: "Asset Out",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("amountIn", {
    header: "Amount In",
    cell: (info) => formatNumber(info.getValue()),
  }),
  columnHelper.accessor("usdValue", {
    header: "USD Value",
    cell: (info) => formatUsd(info.getValue()),
  }),
  columnHelper.accessor("gasUsd", {
    header: "Gas",
    cell: (info) => formatUsd(info.getValue()),
  }),
  columnHelper.accessor("slippageBps", {
    header: "Slippage",
    cell: (info) => `${info.getValue()} bps`,
  }),
  columnHelper.accessor("riskLevel", {
    header: "Risk",
    cell: (info) => {
      const riskLevel = info.getValue()

      return (
        <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
          {riskLevel}
        </span>
      )
    },
  }),
  columnHelper.accessor("riskScore", {
    header: "Risk Score",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("region", {
    header: "Region",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("teamOwner", {
    header: "Owner",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: (info) => new Date(info.getValue()).toLocaleString(),
  }),
]
