"use client";

import { useContracts } from "@/src/hooks/contract/useContracts";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Page() {
  const demo = useContracts();

  const statusType =
    demo.wallet.status.type === "ready"
      ? "ready"
      : demo.wallet.status.type === "wrong-chain"
        ? "warning"
        : "neutral";

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-5 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-black/30 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3">
              <StatusBadge type={statusType}>
                {demo.wallet.status.message}
              </StatusBadge>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              SIWE + EIP-712 Contract Demo
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Local Anvil deployment dashboard for DemoERC20, TokenFaucet and
              SignedOrderBook.
            </p>
          </div>

          <div className="flex shrink-0 justify-start md:justify-end">
            <ConnectButton />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <InfoItem label="Wallet" value={shortAddress(demo.wallet.address)} />
          <InfoItem label="Current Chain" value={demo.wallet.chainId ?? "-"} />
          <InfoItem
            label="Expected Chain"
            value={demo.wallet.expectedChainId}
          />
          <InfoItem
            label="Network Status"
            value={demo.wallet.isReady ? "Ready" : "Not ready"}
          />
        </section>

        {demo.wallet.isWrongNetwork && (
          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-amber-200">
                  Wrong network
                </h2>
                <p className="mt-1 text-sm text-amber-100/80">
                  Your wallet is connected to chain {demo.wallet.chainId}, but
                  this deployment expects chain {demo.wallet.expectedChainId}.
                </p>
              </div>

              <button
                disabled={demo.wallet.isSwitchingChain}
                onClick={() => demo.wallet.switchToExpectedChain()}
                className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {demo.wallet.isSwitchingChain
                  ? "Switching..."
                  : `Switch to ${demo.wallet.expectedChainId}`}
              </button>
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-400">Demo Token</p>
                <h2 className="mt-1 text-xl font-semibold">
                  {demo.demoToken.name ?? "-"}
                </h2>
              </div>

              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-300">
                ERC20
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              <InfoItem label="Symbol" value={demo.demoToken.symbol ?? "-"} />
              <InfoItem label="Balance" value={demo.demoToken.balance} />
              <InfoItem
                label="Decimals"
                value={demo.demoToken.decimals ?? "-"}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-400">Faucet</p>
                <h2 className="mt-1 text-xl font-semibold">Token Faucet</h2>
              </div>

              <StatusBadge
                type={demo.tokenFaucet.canClaim ? "ready" : "neutral"}
              >
                {demo.tokenFaucet.canClaim ? "Claimable" : "Not claimable"}
              </StatusBadge>
            </div>

            <div className="mt-6 grid gap-4">
              <InfoItem
                label="Claim Amount"
                value={demo.tokenFaucet.claimAmount}
              />
              <InfoItem
                label="Can Claim"
                value={String(demo.tokenFaucet.canClaim)}
              />
              <InfoItem
                label="Cooldown"
                value={
                  demo.tokenFaucet.cooldown !== undefined
                    ? `${demo.tokenFaucet.cooldown.toString()} seconds`
                    : "-"
                }
              />
            </div>

            <button
              disabled={
                !demo.wallet.isReady ||
                !demo.tokenFaucet.canClaim ||
                demo.tokenFaucet.isClaimPending
              }
              onClick={() => demo.tokenFaucet.claimAndRefresh()}
              className="mt-6 w-full rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {demo.tokenFaucet.isClaimPending ? "Claiming..." : "Claim Token"}
            </button>

            {!demo.wallet.isReady && (
              <p className="mt-3 text-center text-xs text-zinc-500">
                Connect wallet and switch to the expected chain before claiming.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function shortAddress(address?: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function StatusBadge({
  type,
  children,
}: {
  type: "ready" | "warning" | "neutral";
  children: React.ReactNode;
}) {
  const className =
    type === "ready"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : type === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-zinc-700 bg-zinc-800 text-zinc-300";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="mt-2 break-all text-sm font-medium text-zinc-100">
        {value}
      </div>
    </div>
  );
}
