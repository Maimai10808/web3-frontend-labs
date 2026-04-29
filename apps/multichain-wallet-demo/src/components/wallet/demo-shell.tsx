"use client";

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
