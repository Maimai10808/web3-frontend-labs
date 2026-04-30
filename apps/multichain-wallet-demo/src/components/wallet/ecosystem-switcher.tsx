"use client";

import { ECOSYSTEM_OPTIONS } from "@/lib/multichain/chains";
import { useActiveEcosystem } from "@/hooks/multichain/use-active-ecosystem";

export function EcosystemSwitcher({ compact = false }: { compact?: boolean }) {
  const { ecosystem, setEcosystem } = useActiveEcosystem();

  return (
    <section
      className={
        compact
          ? ""
          : "rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm"
      }
    >
      <h3 className="mb-3 text-base font-semibold">Ecosystem</h3>
      <div className="flex flex-wrap gap-2">
        {ECOSYSTEM_OPTIONS.map((item) => (
          <button
            key={item.value}
            onClick={() => setEcosystem(item.value)}
            className={
              ecosystem === item.value
                ? "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                : "rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
