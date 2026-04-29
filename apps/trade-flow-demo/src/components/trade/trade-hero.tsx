"use client";

import { Activity, CircleAlert, Network, Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";

import { tradingStateChainId } from "@/lib/contracts/trade-order-book";

export function TradeHero() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isExpectedChain = chainId === tradingStateChainId;

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Activity className="size-3.5" />
            Trade Flow Demo
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground sm:text-xl">
            Trade Flow Demo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit, sign, and monitor limit orders from one compact dashboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <HeaderStat
            icon={<Wallet className="size-3.5" />}
            label="Wallet"
            value={isConnected ? "Connected" : "Disconnected"}
          />
          <HeaderStat
            icon={<Network className="size-3.5" />}
            label="Chain"
            value={chainId ? String(chainId) : "-"}
          />
          <HeaderStat
            icon={<CircleAlert className="size-3.5" />}
            label="Status"
            value={isExpectedChain ? "Ready" : "Wrong network"}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-start gap-2 xl:items-end">
        <ConnectButton />
        <div className="truncate text-xs text-muted-foreground">
          {isConnected && address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : "No wallet connected"}
        </div>
      </div>
    </section>
  );
}

function HeaderStat(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
  intent?: "ready" | "warning";
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs text-muted-foreground">
      <span className="text-primary">{props.icon}</span>
      <span>{props.label}</span>
      <span className="font-medium text-foreground">{props.value}</span>
    </div>
  );
}
