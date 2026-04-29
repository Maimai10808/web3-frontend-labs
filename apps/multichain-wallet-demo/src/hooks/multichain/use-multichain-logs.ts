"use client";

import { useMultichainDemoStore } from "@/store/multichain-demo-store";

export function useMultichainLogs() {
  const logs = useMultichainDemoStore((state) => state.logs);
  const pushLog = useMultichainDemoStore((state) => state.pushLog);

  return { logs, pushLog };
}
