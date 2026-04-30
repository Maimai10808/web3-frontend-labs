"use client";

import { useMemo, useState } from "react";
import type { WalletAdapter } from "@/lib/multichain/types";
import type { BtcInjectedWallet } from "@/lib/multichain/btc/types";
import { UnisatWallet } from "@/lib/multichain/btc/unisat";
import { OkxBtcWallet } from "@/lib/multichain/btc/okx";
import { BtcAdapter } from "@/lib/multichain/adapters/btc-adapter";

type SupportedBtcWallet = "unisat" | "okx";

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
