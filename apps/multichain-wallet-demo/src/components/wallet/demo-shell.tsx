"use client";

import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";

import { EcosystemSwitcher } from "./ecosystem-switcher";
import { WalletConnectPanel } from "./wallet-connect-panel";
import { NetworkStatusCard } from "./network-status-card";
import { BindingStatusCard } from "./binding-status-card";
import { SignatureLab } from "./signature-lab";
import { TransactionLab } from "./transaction-lab";
import { CapabilityInspector } from "./capability-inspector";
import { EventLogPanel } from "./event-log-panel";
import { DebugPayloadPanel } from "./debug-payload-panel";
import { TalkingPointsCard } from "./talking-points-card";

export function DemoShell() {
  const { ecosystem, currentConnection } = useWalletAccount();

  return (
    <main className="grid gap-4 px-6 py-6">
      <section className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            multichain-wallet-demo
          </h1>
          <p className="mt-2 max-w-[880px] text-sm leading-6 text-slate-300">
            这个 Demo
            展示的是多链钱包接入的工程抽象。重点不是“连上钱包”，而是连接、网络识别、
            签名适配、交易适配、账户绑定和错误归一。
          </p>
        </div>
        <EcosystemSwitcher />
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Current Wallet Session</h2>
          <span className="rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
            Active ecosystem: {ecosystem}
          </span>
        </div>

        {currentConnection ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-950 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Wallet
              </div>
              <div className="mt-1 text-sm font-medium text-white">
                {currentConnection.providerName}
              </div>
            </div>
            <div className="rounded-xl bg-slate-950 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Address
              </div>
              <div className="mt-1 text-sm font-medium text-white">
                {currentConnection.displayAddress}
              </div>
            </div>
            <div className="rounded-xl bg-slate-950 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Network
              </div>
              <div className="mt-1 text-sm font-medium text-white">
                {currentConnection.networkLabel ?? "-"}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-950 p-4 text-sm text-slate-400">
            No wallet connected for the currently selected ecosystem.
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-4">
          <WalletConnectPanel />
          <NetworkStatusCard />
          <BindingStatusCard />
        </div>

        <div className="grid gap-4">
          <SignatureLab />
          <TransactionLab />
          <CapabilityInspector />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <EventLogPanel />
        <DebugPayloadPanel />
      </section>

      <TalkingPointsCard />
    </main>
  );
}
