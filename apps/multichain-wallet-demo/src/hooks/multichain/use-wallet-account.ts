"use client";

import { useMemo, useState } from "react";
import {
  useAccount,
  type Connector,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useSwitchChain,
} from "wagmi";
import { parseEther } from "viem";
import { EvmAdapter } from "@/lib/multichain/adapters/evm-adapter";
import {
  type WalletName,
  WalletReadyState,
} from "@solana/wallet-adapter-base";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SolanaAdapter } from "@/lib/multichain/adapters/solana-adapter";
import { useBtcWallet } from "./use-btc-wallet";

import { useActiveEcosystem } from "./use-active-ecosystem";
import type {
  ChainEcosystem,
  UnifiedWalletAccount,
  WalletAccount,
  WalletAdapter,
} from "@/lib/multichain/types";
import { useSeiWallet } from "./use-sei-wallet";
import { useMultichainDemoStore } from "@/store/multichain-demo-store";

function debugUnified(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[unified-wallet]", ...args);
  }
}

type EvmWalletId =
  | "metamask"
  | "okx"
  | "coinbase"
  | "walletconnect"
  | "injected";

type EvmWalletOption = {
  id: EvmWalletId;
  label: string;
};

type SolanaWalletId = "phantom" | "solflare" | "okx" | "metamask";

type SolanaWalletOption = {
  id: SolanaWalletId;
  label: string;
};

type InjectedEthereumProvider = {
  isMetaMask?: boolean;
  isOkxWallet?: boolean;
  isOKExWallet?: boolean;
  name?: string;
  providers?: InjectedEthereumProvider[];
};

type SolanaPublicKeyLike = {
  toBase58?: () => string;
  toString?: () => string;
};

type SolanaInjectedProvider = {
  isMetaMask?: boolean;
  publicKey?: SolanaPublicKeyLike | string | null;
  connect?: () => Promise<unknown>;
  disconnect?: () => Promise<void>;
};

const evmWalletOptions: EvmWalletOption[] = [
  { id: "metamask", label: "MetaMask" },
  { id: "okx", label: "OKX Wallet" },
  { id: "coinbase", label: "Coinbase Wallet" },
  { id: "walletconnect", label: "WalletConnect" },
  { id: "injected", label: "Injected Wallet" },
];

const solanaWalletOptions: SolanaWalletOption[] = [
  { id: "phantom", label: "Phantom" },
  { id: "solflare", label: "Solflare" },
  { id: "okx", label: "OKX Wallet" },
  { id: "metamask", label: "MetaMask" },
];

function getInjectedEthereumProviders(): InjectedEthereumProvider[] {
  if (typeof window === "undefined") {
    return [];
  }

  const ethereum = (
    window as Window & { ethereum?: InjectedEthereumProvider }
  ).ethereum;
  if (!ethereum) {
    return [];
  }

  return ethereum.providers?.length ? ethereum.providers : [ethereum];
}

function hasMetaMaskExtension() {
  return getInjectedEthereumProviders().some((provider) => provider.isMetaMask);
}

function hasOkxExtension() {
  if (typeof window === "undefined") {
    return false;
  }

  const windowWithOkx = window as Window & {
    okxwallet?: {
      ethereum?: InjectedEthereumProvider;
    };
  };

  if (windowWithOkx.okxwallet?.ethereum || windowWithOkx.okxwallet) {
    return true;
  }

  return getInjectedEthereumProviders().some((provider) => {
    const providerName = provider.name?.toLowerCase() ?? "";
    return (
      provider.isOkxWallet ||
      provider.isOKExWallet ||
      providerName.includes("okx") ||
      providerName.includes("okex")
    );
  });
}

function getOkxSolanaProvider(): SolanaInjectedProvider | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (
    window as Window & {
      okxwallet?: { solana?: SolanaInjectedProvider };
    }
  ).okxwallet?.solana;
}

function getMetaMaskSolanaProvider(): SolanaInjectedProvider | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const customWindow = window as Window & {
    metamask?: { solana?: SolanaInjectedProvider };
    solana?: SolanaInjectedProvider;
  };

  if (customWindow.metamask?.solana) {
    return customWindow.metamask.solana;
  }

  if (customWindow.solana?.isMetaMask) {
    return customWindow.solana;
  }

  return undefined;
}

function normalizeSolanaAddress(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const candidate = value as {
      publicKey?: SolanaPublicKeyLike | string | null;
      toBase58?: () => string;
      toString?: () => string;
    };

    if (candidate.publicKey) {
      return normalizeSolanaAddress(candidate.publicKey);
    }

    if (typeof candidate.toBase58 === "function") {
      return candidate.toBase58();
    }

    if (typeof candidate.toString === "function") {
      const next = candidate.toString();
      return next === "[object Object]" ? undefined : next;
    }
  }

  return undefined;
}

function resolveEvmConnector(
  walletId: EvmWalletId,
  connectors: readonly Connector[],
): { connector: Connector; walletName: string } {
  const getByIdOrName = (pattern: string) =>
    connectors.find((connector) => {
      const haystack = `${connector.id} ${connector.name}`.toLowerCase();
      return haystack.includes(pattern);
    });

  if (walletId === "metamask") {
    if (!hasMetaMaskExtension()) {
      throw new Error("MetaMask extension not detected.");
    }

    return {
      connector:
        getByIdOrName("metamask") ??
        getByIdOrName("injected") ??
        connectors[0],
      walletName: "MetaMask",
    };
  }

  if (walletId === "okx") {
    if (!hasOkxExtension()) {
      throw new Error("OKX Wallet extension not detected.");
    }

    return {
      connector:
        getByIdOrName("okx") ?? getByIdOrName("injected") ?? connectors[0],
      walletName: "OKX Wallet",
    };
  }

  if (walletId === "coinbase") {
    const connector = getByIdOrName("coinbase");
    if (!connector) {
      throw new Error("Coinbase Wallet connector is not configured.");
    }
    return { connector, walletName: "Coinbase Wallet" };
  }

  if (walletId === "walletconnect") {
    if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
      throw new Error(
        "WalletConnect projectId is missing. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.",
      );
    }

    const connector = getByIdOrName("walletconnect");
    if (!connector) {
      throw new Error("WalletConnect connector is not configured.");
    }
    return { connector, walletName: "WalletConnect" };
  }

  const connector = getByIdOrName("injected");
  if (!connector) {
    throw new Error("Injected wallet connector is not configured.");
  }

  return { connector, walletName: "Injected Wallet" };
}

export function useWalletAccount() {
  const { ecosystem } = useActiveEcosystem();
  const unifiedWallet = useMultichainDemoStore((state) => state.unifiedWallet);
  const [selectedEvmWalletId, setSelectedEvmWalletId] =
    useState<EvmWalletId | null>(null);
  const [selectedSolanaWalletId, setSelectedSolanaWalletId] =
    useState<SolanaWalletId | null>(null);

  const account = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  const { sendTransactionAsync } = useSendTransaction();
  const {
    adapter: seiAdapter,
    walletName: seiWalletName,
    address: seiAddress,
    availableWallets: seiAvailableWallets,
    selectedWallet: selectedSeiWallet,
    selectWallet: selectSeiWallet,
  } = useSeiWallet();

  const { connection } = useConnection();
  const {
    publicKey,
    connected,
    wallet,
    wallets,
    select,
    disconnect,
    signMessage,
    sendTransaction,
  } = useWallet();

  const evmAdapter = useMemo<WalletAdapter>(
    () =>
      new EvmAdapter({
        connectDefault: async () => {
          const first = connectors[0];
          if (!first) {
            throw new Error("No EVM connector available");
          }
          await connectAsync({ connector: first });
        },
        disconnectWallet: () => disconnectAsync(),
        getAddress: () => account.address,
        getChainId: () => account.chainId,
        getConnectorName: () => account.connector?.name ?? "EVM Wallet",
        switchChain: (chainId) => switchChainAsync({ chainId }),
        personalSign: (message) => signMessageAsync({ message }),
        signTypedData: (typedData) =>
          signTypedDataAsync({
            domain: typedData.domain,
            types: typedData.types,
            primaryType: typedData.primaryType,
            message: typedData.message,
          }),
        sendNativeTransaction: async ({ to, value }) => {
          const hash = await sendTransactionAsync({
            to: to as `0x${string}`,
            value: parseEther(value),
          });
          return { hash };
        },
      }),
    [
      account.address,
      account.chainId,
      account.connector?.name,
      connectAsync,
      connectors,
      disconnectAsync,
      sendTransactionAsync,
      signMessageAsync,
      signTypedDataAsync,
      switchChainAsync,
    ],
  );

  const solanaAdapter = useMemo<WalletAdapter>(
    () =>
      new SolanaAdapter({
        connectWallet: async () => {
          debugUnified("selectedSolanaWalletName", selectedSolanaWalletId);
          debugUnified(
            "available wallet adapter names",
            wallets.map((item) => ({
              name: item.adapter.name,
              readyState: item.readyState,
            })),
          );
          debugUnified("current adapter name", wallet?.adapter.name);
          debugUnified("connected", connected, "publicKey", publicKey?.toBase58());

          if (!selectedSolanaWalletId) {
            throw new Error("Select a Solana wallet before connecting");
          }

          if (selectedSolanaWalletId === "okx") {
            const provider = getOkxSolanaProvider();
            if (!provider?.connect) {
              throw new Error(
                "OKX Solana provider was not detected. Install OKX Wallet with Solana support.",
              );
            }
            const rawResult = await provider.connect();
            const address = normalizeSolanaAddress(rawResult) ?? normalizeSolanaAddress(provider.publicKey);
            if (!address) {
              throw new Error("publicKey missing after OKX Solana connect");
            }
            return {
              ecosystem: "solana",
              address,
              displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
              providerName: "OKX Wallet",
              networkId: "solana:devnet",
            };
          }

          if (selectedSolanaWalletId === "metamask") {
            const provider = getMetaMaskSolanaProvider();
            if (!provider?.connect) {
              throw new Error(
                "MetaMask Solana provider was not detected. Install the Solana-compatible MetaMask wallet feature or use Phantom/OKX/Solflare.",
              );
            }
            const rawResult = await provider.connect();
            const address = normalizeSolanaAddress(rawResult) ?? normalizeSolanaAddress(provider.publicKey);
            if (!address) {
              throw new Error("publicKey missing after MetaMask Solana connect");
            }
            return {
              ecosystem: "solana",
              address,
              displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
              providerName: "MetaMask",
              networkId: "solana:devnet",
            };
          }

          const targetWalletName =
            selectedSolanaWalletId === "phantom"
              ? ("Phantom" as WalletName)
              : ("Solflare" as WalletName);
          const targetWallet = wallets.find(
            (item) => item.adapter.name === targetWalletName,
          );

          if (!targetWallet) {
            throw new Error(`${targetWalletName} wallet adapter is not configured.`);
          }

          if (
            targetWallet.readyState !== WalletReadyState.Installed &&
            targetWallet.readyState !== WalletReadyState.Loadable
          ) {
            throw new Error(
              `${targetWalletName} wallet not detected or not ready.`,
            );
          }

          if (wallet?.adapter.name !== targetWalletName) {
            select(targetWalletName);
          }

          try {
            await targetWallet.adapter.connect();
          } catch (error) {
            debugUnified("raw error", error);
            throw error;
          }

          const address = targetWallet.adapter.publicKey?.toBase58();
          if (!address) {
            throw new Error("publicKey missing after connect");
          }

          return {
            ecosystem: "solana",
            address,
            displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
            providerName: targetWallet.adapter.name,
            networkId: "solana:devnet",
          };
        },
        disconnectWallet: () => disconnect(),
        getPublicKey: () => publicKey,
        getConnected: () => connected,
        getWalletName: () => wallet?.adapter.name ?? "Solana Wallet",
        signMessage,
        sendTransaction,
        connection,
      }),
    [
      wallet,
      wallets,
      publicKey,
      connected,
      selectedSolanaWalletId,
      select,
      disconnect,
      signMessage,
      sendTransaction,
      connection,
    ],
  );

  const {
    adapter: btcAdapter,
    walletName: btcWalletName,
    address: btcAddress,
    selectWallet: selectBtcWallet,
  } = useBtcWallet();

  const adapter = useMemo<WalletAdapter | null>(() => {
    if (ecosystem === "evm") return evmAdapter;
    if (ecosystem === "solana") return solanaAdapter;
    if (ecosystem === "btc") return btcAdapter;
    if (ecosystem === "sei") return seiAdapter;
    return null;
  }, [btcAdapter, ecosystem, evmAdapter, seiAdapter, solanaAdapter]);

  const connectedEcosystem = unifiedWallet.account?.namespace ?? null;
  const connectedAdapter = useMemo<WalletAdapter | null>(() => {
    if (connectedEcosystem === "evm") return evmAdapter;
    if (connectedEcosystem === "solana") return solanaAdapter;
    if (connectedEcosystem === "btc") return btcAdapter;
    if (connectedEcosystem === "sei") return seiAdapter;
    return null;
  }, [btcAdapter, connectedEcosystem, evmAdapter, seiAdapter, solanaAdapter]);

  const currentConnection = useMemo<UnifiedWalletAccount | null>(() => {
    if (ecosystem === "evm" && account.isConnected && account.address) {
      return {
        namespace: "evm",
        walletName: account.connector?.name ?? "EVM Wallet",
        address: account.address,
        chainId: account.chainId ? String(account.chainId) : undefined,
      };
    }

    if (ecosystem === "solana" && connected && publicKey) {
      const address = publicKey.toBase58();
      return {
        namespace: "solana",
        walletName: wallet?.adapter.name ?? "Solana Wallet",
        address,
        chainId: "solana-devnet",
      };
    }

    if (ecosystem === "btc" && btcAddress && btcWalletName) {
      return {
        namespace: "btc",
        walletName: btcWalletName,
        address: btcAddress,
        chainId: "bitcoin-mainnet",
      };
    }

    if (ecosystem === "sei" && seiAddress) {
      return {
        namespace: "sei",
        walletName: seiWalletName ?? "Sei Wallet",
        address: seiAddress,
        chainId: "pacific-1",
      };
    }

    return null;
  }, [
    ecosystem,
    account.isConnected,
    account.address,
    account.connector?.name,
    account.chainId,
    connected,
    publicKey,
    wallet?.adapter.name,
    btcAddress,
    btcWalletName,
    seiAddress,
    seiWalletName,
  ]);

  const disconnectAllWallets = async (targetEcosystem?: ChainEcosystem) => {
    await Promise.allSettled([
      targetEcosystem !== "evm" && account.isConnected
        ? disconnectAsync()
        : Promise.resolve(),
      targetEcosystem !== "solana" && connected
        ? disconnect()
        : Promise.resolve(),
      targetEcosystem !== "btc" && (btcAddress || btcWalletName)
        ? btcAdapter.disconnect()
        : Promise.resolve(),
      targetEcosystem !== "sei" && seiAddress
        ? seiAdapter.disconnect()
        : Promise.resolve(),
    ]);
  };

  debugUnified("current connection snapshot", currentConnection);

  return {
    adapter,
    connectedAdapter,
    ecosystem,
    connectedEcosystem,
    currentConnection,
    evmWalletOptions,
    selectedEvmWalletId,
    selectEvmWallet: setSelectedEvmWalletId,
    connectEvmWith: async (walletId: EvmWalletId): Promise<WalletAccount> => {
      const { connector, walletName } = resolveEvmConnector(walletId, connectors);
      if (account.isConnected) {
        debugUnified("disconnect current evm wallet before reconnect", {
          currentConnector: account.connector?.name,
          nextWallet: walletName,
        });
        await disconnectAsync();
      }
      const result = await connectAsync({ connector });
      const address = result.accounts[0];
      if (!address) {
        throw new Error("Failed to get EVM account after connect");
      }

      return {
        ecosystem: "evm",
        address,
        displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
        providerName: walletName,
        chainId: result.chainId,
      };
    },
    evmStatus: account.status,
    evmIsConnected: account.isConnected,
    solanaWalletOptions,
    selectedSolanaWalletId,
    selectSolanaWallet: setSelectedSolanaWalletId,
    btcWalletName,
    btcAddress,
    selectBtcWallet,
    seiWalletName,
    seiAddress,
    seiAvailableWallets,
    selectedSeiWallet,
    selectSeiWallet,
    disconnectAllWallets,
  };
}
