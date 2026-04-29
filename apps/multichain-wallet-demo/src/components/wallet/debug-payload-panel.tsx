"use client";

import { useMultichainDemoStore } from "@/store/multichain-demo-store";

export function DebugPayloadPanel() {
  const debugPayloads = useMultichainDemoStore((state) => state.debugPayloads);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">Debug Payload</h3>
      <pre className="max-h-[360px] overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
        {JSON.stringify(debugPayloads, null, 2)}
      </pre>
    </section>
  );
}
