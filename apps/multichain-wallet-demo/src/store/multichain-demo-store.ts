"use client";

import { create } from "zustand";
import type {
  ChainEcosystem,
  EventLogEntry,
  MultiChainError,
  SignatureResult,
  TransactionResult,
  WalletBindingStatus,
} from "@/lib/multichain/types";

type DebugPayloads = {
  lastSignInput?: unknown;
  lastSignResult?: SignatureResult | null;
  lastTxInput?: unknown;
  lastTxResult?: TransactionResult | null;
  lastBindPayload?: unknown;
  lastBindResult?: unknown;
  lastError?: MultiChainError | null;
};

type MultichainDemoStore = {
  ecosystem: ChainEcosystem;
  bindingStatus: WalletBindingStatus;
  boundAddress?: string;
  lastNonce?: string;
  logs: EventLogEntry[];
  debugPayloads: DebugPayloads;
  setEcosystem: (ecosystem: ChainEcosystem) => void;
  setBindingStatus: (status: WalletBindingStatus) => void;
  setBoundAddress: (address?: string) => void;
  setLastNonce: (nonce?: string) => void;
  pushLog: (entry: Omit<EventLogEntry, "id" | "timestamp">) => void;
  setDebugPayload: <K extends keyof DebugPayloads>(
    key: K,
    value: DebugPayloads[K],
  ) => void;
  resetBinding: () => void;
};

export const useMultichainDemoStore = create<MultichainDemoStore>((set) => ({
  ecosystem: "evm",
  bindingStatus: "unbound",
  boundAddress: undefined,
  lastNonce: undefined,
  logs: [],
  debugPayloads: {},
  setEcosystem: (ecosystem) => set({ ecosystem }),
  setBindingStatus: (bindingStatus) => set({ bindingStatus }),
  setBoundAddress: (boundAddress) => set({ boundAddress }),
  setLastNonce: (lastNonce) => set({ lastNonce }),
  pushLog: (entry) =>
    set((state) => ({
      logs: [
        {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
        ...state.logs,
      ].slice(0, 50),
    })),
  setDebugPayload: (key, value) =>
    set((state) => ({
      debugPayloads: {
        ...state.debugPayloads,
        [key]: value,
      },
    })),
  resetBinding: () =>
    set({
      bindingStatus: "unbound",
      boundAddress: undefined,
      lastNonce: undefined,
    }),
}));
