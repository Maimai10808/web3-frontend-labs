"use client";

import { create } from "zustand";
import type {
  ChainEcosystem,
  EventLogEntry,
  MultiChainError,
  SignatureResult,
  TransactionResult,
  UnifiedWalletAccount,
  UnifiedWalletState,
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
  unifiedWallet: UnifiedWalletState;
  setEcosystem: (ecosystem: ChainEcosystem) => void;
  setBindingStatus: (status: WalletBindingStatus) => void;
  setBoundAddress: (address?: string) => void;
  setLastNonce: (nonce?: string) => void;
  setUnifiedWalletState: (state: UnifiedWalletState) => void;
  setUnifiedWalletConnecting: (namespace: ChainEcosystem) => void;
  setUnifiedWalletConnected: (account: UnifiedWalletAccount) => void;
  setUnifiedWalletError: (namespace: ChainEcosystem, error: string) => void;
  resetUnifiedWallet: () => void;
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
  unifiedWallet: {
    status: "disconnected",
  },
  setEcosystem: (ecosystem) => set({ ecosystem }),
  setBindingStatus: (bindingStatus) => set({ bindingStatus }),
  setBoundAddress: (boundAddress) => set({ boundAddress }),
  setLastNonce: (lastNonce) => set({ lastNonce }),
  setUnifiedWalletState: (unifiedWallet) => set({ unifiedWallet }),
  setUnifiedWalletConnecting: (namespace) =>
    set({
      unifiedWallet: {
        status: "connecting",
        account: undefined,
        error: undefined,
      },
      ecosystem: namespace,
    }),
  setUnifiedWalletConnected: (account) =>
    set({
      unifiedWallet: {
        status: "connected",
        account,
        error: undefined,
      },
      ecosystem: account.namespace,
    }),
  setUnifiedWalletError: (namespace, error) =>
    set({
      unifiedWallet: {
        status: "error",
        account: undefined,
        error,
      },
      ecosystem: namespace,
    }),
  resetUnifiedWallet: () =>
    set({
      unifiedWallet: {
        status: "disconnected",
        account: undefined,
        error: undefined,
      },
    }),
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
