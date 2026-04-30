"use client";

import { useCallback, useMemo, useState } from "react";

import type { WalletAdapter } from "@/lib/multichain/types";
import { SeiAdapter } from "@/lib/multichain/adapters/sei-adapter";
import { seiChainConfiguration } from "@/lib/multichain/sei/config";

type SeiKey = {
  bech32Address: string;
};

type SeiOfflineSigner = {
  getAccounts?: () => Promise<Array<{ address: string }>>;
};

type SeiWindowProvider = {
  enable?: (chainId: string) => Promise<void>;
  getKey?: (chainId: string) => Promise<SeiKey>;
  getOfflineSigner?: (chainId: string) => SeiOfflineSigner;
  getOfflineSignerOnlyAmino?: (chainId: string) => SeiOfflineSigner;
  getOfflineSignerAuto?: (chainId: string) => Promise<SeiOfflineSigner>;
  signArbitrary?: (
    chainId: string,
    signer: string,
    message: string,
  ) => Promise<{
    signature: string;
    pub_key: {
      type: string;
      value: string;
    };
  }>;
};

type SeiWalletSession = {
  address: string;
  chainId: string;
  walletName: string;
  provider: SeiWindowProvider;
};

declare global {
  interface Window {
    compass?: SeiWindowProvider;
    keplr?: SeiWindowProvider;
    leap?: SeiWindowProvider;
  }
}

function getInjectedSeiWallet():
  | { provider: SeiWindowProvider; walletName: string }
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.compass) {
    return {
      provider: window.compass,
      walletName: "Compass",
    };
  }

  if (window.keplr) {
    return {
      provider: window.keplr,
      walletName: "Keplr",
    };
  }

  if (window.leap) {
    return {
      provider: window.leap,
      walletName: "Leap",
    };
  }

  return null;
}

async function getAddressFromProvider(provider: SeiWindowProvider) {
  const { chainId } = seiChainConfiguration;

  if (provider.getKey) {
    const key = await provider.getKey(chainId);
    if (key?.bech32Address) {
      return key.bech32Address;
    }
  }

  const signer =
    provider.getOfflineSigner?.(chainId) ??
    provider.getOfflineSignerOnlyAmino?.(chainId) ??
    (provider.getOfflineSignerAuto
      ? await provider.getOfflineSignerAuto(chainId)
      : undefined);

  const accounts = await signer?.getAccounts?.();
  const address = accounts?.[0]?.address;
  if (!address) {
    throw new Error("No Sei account returned from wallet");
  }

  return address;
}

export function useSeiWallet(): {
  adapter: WalletAdapter;
  walletName: string | null;
  address: string | null;
  availableWalletName: string | null;
} {
  const [session, setSession] = useState<SeiWalletSession | null>(null);
  const injected = getInjectedSeiWallet();

  const connectWallet = useCallback(async () => {
    const nextInjected = getInjectedSeiWallet();
    if (!nextInjected) {
      throw new Error("No Sei wallet installed. Install Compass, Keplr, or Leap.");
    }

    const { provider, walletName } = nextInjected;
    await provider.enable?.(seiChainConfiguration.chainId);
    const address = await getAddressFromProvider(provider);

    setSession({
      address,
      chainId: seiChainConfiguration.chainId,
      walletName,
      provider,
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    setSession(null);
  }, []);

  const adapter = useMemo<WalletAdapter>(
    () =>
      new SeiAdapter({
        connectWallet,
        disconnectWallet: async () => {
          disconnectWallet();
        },
        getAddress: () => session?.address,
        getChainId: () => session?.chainId ?? seiChainConfiguration.chainId,
        getWalletName: () => session?.walletName ?? "Sei Wallet",
        signArbitrary: session?.provider.signArbitrary,
      }),
    [connectWallet, disconnectWallet, session],
  );

  return {
    adapter,
    walletName: session?.walletName ?? null,
    address: session?.address ?? null,
    availableWalletName: injected?.walletName ?? null,
  };
}
