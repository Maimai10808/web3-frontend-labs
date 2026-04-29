"use client";

import { useWalletAccount } from "@/hooks/multichain/use-wallet-account";

export function CapabilityInspector() {
  const { adapter } = useWalletAccount();
  const capabilities = adapter?.getCapabilities();

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">Capability Inspector</h3>
      <pre className="overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
        {JSON.stringify(
          capabilities ?? { status: "adapter-not-ready" },
          null,
          2,
        )}
      </pre>
    </section>
  );
}
