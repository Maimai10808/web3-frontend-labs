"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { create } from "zustand";

import type { WalletAccount, WalletAdapter } from "@/lib/multichain/types";
import { SeiAdapter } from "@/lib/multichain/adapters/sei-adapter";
import {
  getSeiPacificChainInfo,
  seiChainConfiguration,
} from "@/lib/multichain/sei/config";

type SeiKey = {
  bech32Address: string;
};

type SeiOfflineSigner = {
  getAccounts?: () => Promise<Array<{ address: string }>>;
};

type SeiWindowProvider = {
  experimentalSuggestChain?: (
    chainInfo: ReturnType<typeof getSeiPacificChainInfo>,
  ) => Promise<void>;
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

type SeiWalletStore = {
  session: SeiWalletSession | null;
  selectedWallet: SupportedSeiWallet | null;
  setSession: (session: SeiWalletSession | null) => void;
  setSelectedWallet: (wallet: SupportedSeiWallet | null) => void;
};

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

const useSeiWalletStore = create<SeiWalletStore>((set) => ({
  session: null,
  selectedWallet: null,
  setSession: (session) => set({ session }),
  setSelectedWallet: (selectedWallet) => set({ selectedWallet }),
}));

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

async function getAddressFromProvider(
  provider: SeiWindowProvider,
  noAccountMessage: string,
) {
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
    throw new Error(noAccountMessage);
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
  const t = useTranslations("multichainDemo.seiWallet");
  const session = useSeiWalletStore((state) => state.session);
  const selectedWallet = useSeiWalletStore((state) => state.selectedWallet);
  const setSession = useSeiWalletStore((state) => state.setSession);
  const setSelectedWallet = useSeiWalletStore(
    (state) => state.setSelectedWallet,
  );
  const detectedWallets = useMemo(() => getDetectedSeiWallets(), []);

  const connectWallet = useCallback(async () => {
    debugSei("selected wallet", selectedWallet);
    debugSei(
      "provider detected",
      detectedWallets.map((wallet) => wallet.walletName),
    );

    if (!selectedWallet) {
      throw new Error(t("errorSelectWallet"));
    }

    const selectedProvider = detectedWallets.find(
      (wallet) => wallet.type === selectedWallet,
    );

    if (!selectedProvider) {
      throw new Error(t("errorWalletNotInstalled"));
    }

    const { provider, walletName } = selectedProvider;
    if (typeof provider.experimentalSuggestChain === "function") {
      try {
        await provider.experimentalSuggestChain(getSeiPacificChainInfo());
      } catch (error) {
        debugSei("suggest chain failed", error);
        throw new Error(t("errorSuggestChain", {
          wallet: walletName,
          message: error instanceof Error ? error.message : "unknown error",
        }));
      }
    }

    try {
      await provider.enable?.(seiChainConfiguration.chainId);
    } catch (error) {
      debugSei("enable failed", error);
      throw new Error(t("errorEnableChain", {
        wallet: walletName,
        message: error instanceof Error ? error.message : "unknown error",
      }));
    }

    const address = await getAddressFromProvider(provider, t("errorNoAccount"));
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
  }, [detectedWallets, selectedWallet, setSession, t]);

  const disconnectWallet = useCallback(() => {
    setSession(null);
  }, [setSession]);

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
