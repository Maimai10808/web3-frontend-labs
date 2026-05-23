"use client"

import {
  ActivityIcon,
  ArrowRightLeftIcon,
  CopyIcon,
  ExternalLinkIcon,
  ShieldAlertIcon,
  WalletIcon,
} from "lucide-react"

import { Button } from "@web3-frontend-labs/ui/components/button"
import { Badge } from "@web3-frontend-labs/ui/components/badge"
import { Separator } from "@web3-frontend-labs/ui/components/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@web3-frontend-labs/ui/components/sheet"

import type { Web3TableActivity } from "@/types/web3-activities.types"

type Web3ActivityDetailDrawerProps = {
  activity: Web3TableActivity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="break-all text-sm">{value}</div>
    </div>
  )
}

function copyToClipboard(value: string) {
  void navigator.clipboard?.writeText(value)
}

export function Web3ActivityDetailDrawer({
  activity,
  open,
  onOpenChange,
}: Web3ActivityDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {activity ? (
          <div className="space-y-6">
            <SheetHeader>
              <div className="flex size-11 items-center justify-center rounded-xl border bg-muted/40">
                <ActivityIcon className="size-5 text-muted-foreground" />
              </div>

              <div>
                <SheetTitle className="mt-3">
                  Activity Detail
                </SheetTitle>
                <SheetDescription>
                  Inspect transaction, wallet and risk information.
                </SheetDescription>
              </div>
            </SheetHeader>

            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{activity.status}</Badge>
                <Badge variant="outline">{activity.chain}</Badge>
                <Badge variant="outline">{activity.protocol}</Badge>
                <Badge variant="outline">{activity.riskLevel} risk</Badge>
              </div>

              <div className="mt-4 space-y-1">
                <div className="font-mono text-sm font-medium">
                  {activity.id}
                </div>
                <div className="text-sm text-muted-foreground">
                  {activity.eventType} · {activity.createdAt}
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <WalletIcon className="size-4" />
                Wallet
              </div>

              <div className="grid gap-4">
                <DetailItem label="Wallet Tag" value={activity.walletTag} />

                <DetailItem
                  label="Wallet Address"
                  value={
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {activity.walletAddress}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => copyToClipboard(activity.walletAddress)}
                      >
                        <CopyIcon className="size-3.5" />
                      </Button>
                    </div>
                  }
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightLeftIcon className="size-4" />
                Transaction
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Asset In" value={activity.assetIn} />
                <DetailItem label="Asset Out" value={activity.assetOut} />
                <DetailItem label="Amount In" value={activity.amountIn} />
                <DetailItem
                  label="USD Value"
                  value={formatUsd(activity.usdValue)}
                />
                <DetailItem label="Gas" value={formatUsd(activity.gasUsd)} />
                <DetailItem
                  label="Slippage"
                  value={`${activity.slippageBps} bps`}
                />
                <DetailItem label="Block" value={activity.blockNumber} />
              </div>

              <DetailItem
                label="Transaction Hash"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{activity.txHash}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => copyToClipboard(activity.txHash)}
                    >
                      <CopyIcon className="size-3.5" />
                    </Button>
                  </div>
                }
              />
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlertIcon className="size-4" />
                Risk & Ownership
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Risk Level" value={activity.riskLevel} />
                <DetailItem label="Risk Score" value={activity.riskScore} />
                <DetailItem label="Region" value={activity.region} />
                <DetailItem label="Team Owner" value={activity.teamOwner} />
                <DetailItem label="Retry Count" value={activity.retryCount} />
                <DetailItem
                  label="Confirmations"
                  value={activity.confirmationCount}
                />
              </div>

              <DetailItem label="Notes" value={activity.notes} />
            </section>

            <div className="flex gap-2">
              <Button className="gap-2">
                <ExternalLinkIcon className="size-4" />
                Open explorer
              </Button>

              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
