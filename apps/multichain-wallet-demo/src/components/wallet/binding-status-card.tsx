"use client";

import { useBindWallet } from "@/hooks/multichain/use-bind-wallet";
import { useMultichainDemoStore } from "@/store/multichain-demo-store";

export function BindingStatusCard() {
  const { bind, isPending, error } = useBindWallet();

  const bindingStatus = useMultichainDemoStore((state) => state.bindingStatus);
  const boundAddress = useMultichainDemoStore((state) => state.boundAddress);
  const lastNonce = useMultichainDemoStore((state) => state.lastNonce);
  const resetBinding = useMultichainDemoStore((state) => state.resetBinding);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">Account Binding</h3>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span>Status</span>
        <strong>{bindingStatus}</strong>
      </div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span>Bound Address</span>
        <strong className="truncate text-right">{boundAddress ?? "-"}</strong>
      </div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span>Last Nonce</span>
        <strong>{lastNonce ?? "-"}</strong>
      </div>

      {error ? (
        <p className="mt-2 text-sm text-rose-300">{error.message}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => bind()}
          disabled={isPending}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Binding..." : "Bind Wallet"}
        </button>
        <button
          onClick={resetBinding}
          className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-600"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
