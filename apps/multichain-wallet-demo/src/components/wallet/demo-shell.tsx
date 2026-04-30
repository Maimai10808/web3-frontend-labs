"use client";

import { EventLogPanel } from "./event-log-panel";
import { MultichainOverview } from "./multichain-overview";
import { useMultichainDemoStore } from "@/store/multichain-demo-store";
import { WalletControlPanel } from "./wallet-control-panel";
import { IntentLabPanel } from "./intent-lab-panel";

export function DemoShell() {
  const unifiedWallet = useMultichainDemoStore((state) => state.unifiedWallet);

  return (
    <main className="grid gap-4 px-6 py-6">
      <MultichainOverview unifiedWallet={unifiedWallet} />

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-4">
          <WalletControlPanel />
        </div>

        <div className="grid gap-4">
          <IntentLabPanel />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <EventLogPanel />
      </section>
    </main>
  );
}
