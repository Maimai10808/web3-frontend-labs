"use client";

import { useMultichainDemoStore } from "@/store/multichain-demo-store";

export function useActiveEcosystem() {
  const ecosystem = useMultichainDemoStore((state) => state.ecosystem);
  const setEcosystem = useMultichainDemoStore((state) => state.setEcosystem);

  return { ecosystem, setEcosystem };
}
