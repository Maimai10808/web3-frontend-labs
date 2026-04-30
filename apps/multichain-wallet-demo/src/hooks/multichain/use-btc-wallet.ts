"use client";

import { useMemo, useState } from "react";
import type { WalletAdapter } from "@/lib/multichain/types";
import type { BtcInjectedWallet } from "@/lib/multichain/btc/types";
import { UnisatWallet } from "@/lib/multichain/btc/unisat";
import { OkxBtcWallet } from "@/lib/multichain/btc/okx";
import { BtcAdapter } from "@/lib/multichain/adapters/btc-adapter";

type SupportedBtcWallet = "unisat" | "okx";

function debugBtc(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[btc-wallet]", ...args);
  }
}

export function useBtcWallet(): {
  adapter: WalletAdapter;
  walletName: string | null;
  address: string | null;
  selectWallet: (wallet: SupportedBtcWallet) => void;
  resetWallet: () => void;
} {
  const [wallet, setWallet] = useState<BtcInjectedWallet | null>(null);
  const [address, setAddress] = useState<string | null>(null);

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
    [wallet, address],
  );

  return {
    adapter,
    walletName: wallet?.name ?? null,
    address,
    selectWallet,
    resetWallet,
  };
}
