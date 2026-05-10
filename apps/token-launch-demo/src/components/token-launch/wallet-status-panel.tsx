"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { tokenLaunchChainId } from "@/lib/contracts/token-launch";

export function WalletStatusPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isExpectedChain = chainId === tokenLaunchChainId;

  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Wallet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Connect a wallet on chain {tokenLaunchChainId} before launching a
            token.
          </p>
        </div>

        <ConnectButton />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <StatusItem
          label="Connection"
          value={isConnected ? "Connected" : "Not connected"}
          tone={isConnected ? "success" : "muted"}
        />
        <StatusItem label="Wallet" value={address ?? "No wallet selected"} />
        <StatusItem
          label="Network"
          value={
            chainId
              ? isExpectedChain
                ? `Chain ${chainId}`
                : `Wrong chain: ${chainId}`
              : "Unknown"
          }
          tone={!chainId || isExpectedChain ? "muted" : "warning"}
        />
      </div>
    </section>
  );
}

function StatusItem({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-white text-slate-900";

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="break-all text-sm">{value}</div>
    </div>
  );
}
