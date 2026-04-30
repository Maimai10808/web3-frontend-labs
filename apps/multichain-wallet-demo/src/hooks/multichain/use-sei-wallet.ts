"use client";

import { useCallback, useMemo, useState } from "react";

import type { WalletAccount, WalletAdapter } from "@/lib/multichain/types";
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

type SupportedSeiWallet = "compass" | "keplr" | "leap";

declare global {
  interface Window {
    compass?: SeiWindowProvider;
    compassWallet?: SeiWindowProvider;
    keplr?: SeiWindowProvider;
    leap?: SeiWindowProvider;
  }
}

function debugSei(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[sei-wallet]", ...args);
  }
}

function getDetectedSeiWallets() {
  if (typeof window === "undefined") {
    return [] as Array<{
      type: SupportedSeiWallet;
      walletName: string;
      provider: SeiWindowProvider;
    }>;
  }

  const wallets: Array<{
    type: SupportedSeiWallet;
    walletName: string;
    provider: SeiWindowProvider;
  }> = [];

  const compassProvider = window.compass ?? window.compassWallet;
  if (compassProvider) {
    wallets.push({
      type: "compass",
      walletName: "Compass",
      provider: compassProvider,
    });
  }

  if (window.keplr) {
    wallets.push({
      type: "keplr",
      walletName: "Keplr",
      provider: window.keplr,
    });
  }

  if (window.leap) {
    wallets.push({
      type: "leap",
      walletName: "Leap",
      provider: window.leap,
    });
  }

  return wallets;
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
  availableWallets: Array<{
    type: SupportedSeiWallet;
    walletName: string;
  }>;
  selectedWallet: SupportedSeiWallet | null;
  selectWallet: (wallet: SupportedSeiWallet) => void;
} {
  const [session, setSession] = useState<SeiWalletSession | null>(null);
  const [selectedWallet, setSelectedWallet] =
    useState<SupportedSeiWallet | null>(null);
  const detectedWallets = getDetectedSeiWallets();

  const connectWallet = useCallback(async () => {
    debugSei("selected wallet", selectedWallet);
    debugSei(
      "provider detected",
      detectedWallets.map((wallet) => wallet.walletName),
    );

    if (!selectedWallet) {
      throw new Error("Select a Sei wallet before connecting.");
    }

    const selectedProvider = detectedWallets.find(
      (wallet) => wallet.type === selectedWallet,
    );

    if (!selectedProvider) {
      throw new Error(
        "Selected Sei wallet is not installed. Install Compass, Keplr, or Leap.",
      );
    }

    const { provider, walletName } = selectedProvider;
    await provider.enable?.(seiChainConfiguration.chainId);
    const address = await getAddressFromProvider(provider);
    debugSei("normalized account", {
      walletName,
      address,
      chainId: seiChainConfiguration.chainId,
    });

    setSession({
      address,
      chainId: seiChainConfiguration.chainId,
      walletName,
      provider,
    });

    return {
      ecosystem: "sei",
      address,
      displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
      providerName: walletName,
      networkId: seiChainConfiguration.chainId,
    } satisfies WalletAccount;
  }, [detectedWallets, selectedWallet]);

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
    availableWallets: detectedWallets.map((wallet) => ({
      type: wallet.type,
      walletName: wallet.walletName,
    })),
    selectedWallet,
    selectWallet: setSelectedWallet,
  };
}
