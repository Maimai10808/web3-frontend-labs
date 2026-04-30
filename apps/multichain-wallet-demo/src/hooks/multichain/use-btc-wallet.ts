"use client";

import { useMemo } from "react";
import { create } from "zustand";
import type { WalletAdapter } from "@/lib/multichain/types";
import type { BtcInjectedWallet } from "@/lib/multichain/btc/types";
import { UnisatWallet } from "@/lib/multichain/btc/unisat";
import { OkxBtcWallet } from "@/lib/multichain/btc/okx";
import { BtcAdapter } from "@/lib/multichain/adapters/btc-adapter";

type SupportedBtcWallet = "unisat" | "okx";

type BtcWalletStore = {
  wallet: BtcInjectedWallet | null;
  address: string | null;
  setWallet: (wallet: BtcInjectedWallet | null) => void;
  setAddress: (address: string | null) => void;
};

function debugBtc(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[btc-wallet]", ...args);
  }
}

const useBtcWalletStore = create<BtcWalletStore>((set) => ({
  wallet: null,
  address: null,
  setWallet: (wallet) => set({ wallet }),
  setAddress: (address) => set({ address }),
}));

export function useBtcWallet(): {
  adapter: WalletAdapter;
  walletName: string | null;
  address: string | null;
  selectWallet: (wallet: SupportedBtcWallet) => void;
  resetWallet: () => void;
} {
  const wallet = useBtcWalletStore((state) => state.wallet);
  const address = useBtcWalletStore((state) => state.address);
  const setWallet = useBtcWalletStore((state) => state.setWallet);
  const setAddress = useBtcWalletStore((state) => state.setAddress);

  const selectWallet = (walletType: SupportedBtcWallet) => {
    debugBtc("selected wallet", walletType);
    if (walletType === "unisat") {
      setWallet(new UnisatWallet());
      setAddress(null);
      return;
    }

    if (walletType === "okx") {
      setWallet(new OkxBtcWallet());
      setAddress(null);
    }
  };

  const resetWallet = () => {
    debugBtc("reset wallet");
    setWallet(null);
    setAddress(null);
  };

  const adapter = useMemo<WalletAdapter>(
    () =>
      new BtcAdapter({
        wallet,
        setWallet,
        address,
        setAddress,
      }),
    [wallet, setWallet, address, setAddress],
  );

  return {
    adapter,
    walletName: wallet?.name ?? null,
    address,
    selectWallet,
    resetWallet,
  };
}
