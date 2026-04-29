"use client";

import { useNetworkStatus } from "@/hooks/multichain/use-network-status";
import { DEFAULT_CHAIN_BY_ECOSYSTEM } from "@/lib/multichain/chains";

export function NetworkStatusCard() {
  const { status, adapter, refresh } = useNetworkStatus();

  const handleSwitch = async () => {
    if (!adapter?.switchNetwork || !status?.expectedChainId) return;
    await adapter.switchNetwork(status.expectedChainId);
    await refresh();
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">Network Status</h3>

      <pre className="overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
        {JSON.stringify(status ?? { status: "idle" }, null, 2)}
      </pre>

      {status?.switchRequired && status.switchAvailable ? (
        <button
          onClick={handleSwitch}
          className="mt-3 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Switch to target network
        </button>
      ) : null}

      {!status?.switchAvailable && status?.ecosystem !== "evm" ? (
        <p className="mt-3 text-xs leading-5 text-slate-400">
          {status?.ecosystem} 通常不是 EVM 那种 switchChain 模型，更多依赖钱包或
          provider 上下文切换。
        </p>
      ) : null}

      <p className="mt-3 text-xs leading-5 text-slate-400">
        Current target:{" "}
        {DEFAULT_CHAIN_BY_ECOSYSTEM[status?.ecosystem ?? "evm"].name}
      </p>
    </section>
  );
}
