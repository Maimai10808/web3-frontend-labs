"use client";

import { useMemo } from "react";
import { useMultichainLogs } from "@/hooks/multichain/use-multichain-logs";
import { useTranslations } from "next-intl";

const MAX_VISIBLE_LOGS = 6;

export function EventLogPanel() {
  const { logs } = useMultichainLogs();
  const t = useTranslations("multichainDemo.eventLog");

  const visibleLogs = useMemo(() => {
    return logs.slice(-MAX_VISIBLE_LOGS);
  }, [logs]);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">{t("title")}</h3>

      <div className="grid gap-2">
        {visibleLogs.length === 0 ? (
          <p className="text-sm text-slate-400">{t("empty")}</p>
        ) : null}

        {visibleLogs.map((log) => (
          <div
            key={log.id}
            className={
              log.level === "error"
                ? "rounded-xl bg-rose-950/50 p-3"
                : log.level === "success"
                  ? "rounded-xl bg-emerald-950/40 p-3"
                  : "rounded-xl bg-slate-800/90 p-3"
            }
          >
            <div className="text-xs text-slate-300">{log.timestamp}</div>
            <div className="font-semibold">{log.title}</div>
            <div className="text-sm text-slate-300">{log.message}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
