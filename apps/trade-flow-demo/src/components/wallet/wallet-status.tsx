"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { useReadContract } from "wagmi";
import {
  mockTokenContract,
  tradingStateChainId,
} from "@/lib/contracts/trade-order-book";

export function WalletStatus({ compact = false }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const isExpectedChain = chainId === tradingStateChainId;

  const nameQuery = useReadContract({
    ...mockTokenContract,
    functionName: "name",
  });

  const symbolQuery = useReadContract({
    ...mockTokenContract,
    functionName: "symbol",
  });

  const totalSupplyQuery = useReadContract({
    ...mockTokenContract,
    functionName: "totalSupply",
  });

  return (
    <WalletStatusView
      isConnected={isConnected}
      address={address}
      chainId={chainId}
      isExpectedChain={isExpectedChain}
      symbol={String(symbolQuery.data ?? "-")}
      supply={totalSupplyQuery.data?.toString() ?? "-"}
      tokenName={String(nameQuery.data ?? "-")}
      compact={compact}
    />
  );
}

export function WalletStatusView(props: {
  isConnected: boolean;
  address?: `0x${string}`;
  chainId?: number;
  isExpectedChain: boolean;
  symbol: string;
  supply: string;
  tokenName: string;
  compact?: boolean;
}) {
  return (
    <section className="h-full rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-foreground">
            Wallet / Network / Contract
          </div>
          <p className="text-sm text-muted-foreground">
            Execution status and contract readiness.
          </p>
        </div>

        <ConnectButton />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat
          label="Wallet"
          value={props.isConnected ? "Connected" : "Disconnected"}
        />
        <Stat
          label="Current Chain"
          value={props.chainId ? String(props.chainId) : "-"}
        />
        <Stat label="Expected Chain" value={String(tradingStateChainId)} />
        <Stat
          label="Network Status"
          value={props.isExpectedChain ? "Ready" : "Wrong Network"}
        />
        <Stat label="Token" value={props.symbol} />
        <Stat
          label="Contract"
          value={`${mockTokenContract.address.slice(0, 6)}...${mockTokenContract.address.slice(-4)}`}
        />
      </div>

      {!props.compact ? (
        <div className="mt-4 space-y-3">
          <CompactRow
            label="Wallet Address"
            value={props.address ?? "Not connected"}
            breakAll
          />
          <CompactRow
            label="Contract Address"
            value={mockTokenContract.address}
            breakAll
          />
          <CompactRow
            label="Token Metadata"
            value={`${props.tokenName} (${props.symbol})`}
          />
          <CompactRow label="Token Supply" value={props.supply} />

          {!props.isExpectedChain ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Switch wallet network to chain {tradingStateChainId} before
              submitting.
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {props.label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-foreground">
        {props.value}
      </div>
    </div>
  );
}

function CompactRow(props: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted/50 px-3 py-2.5 sm:grid-cols-[120px_1fr] sm:items-start">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {props.label}
      </div>
      <div
        className={`text-sm font-medium text-foreground sm:text-right ${
          props.breakAll ? "break-all" : ""
        }`}
      >
        {props.value}
      </div>
    </div>
  );
}
